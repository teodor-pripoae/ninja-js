before_filters = {
  clearContent: function () {
    $('#content').html('');
  },
  showAnimation: function () {
    Animation.show()
  },

  selectNotebook: function (params) {
    var id = params["id"];
    if (! id) { return ;};
    $("#sidebar .notebook.active").removeClass("active");
    $("#sidebar .notebook[data-id="+id+"]").addClass("active");
  },
}

/* Models */
NoteBook = new Ninja.Model({
  model_name: "notebook",
  url: function (id) {
    return BASE_URL + "/api/v1/notebook/" + id + "/";
  },
  static_url: BASE_URL + "/api/v1/notebook/",
});

Note = new Ninja.Model({
  model_name: "note",
  url: function (id) {
    return BASE_URL + "/api/v1/note/" + id + "/";
  },
  static_url: BASE_URL + "/api/v1/note/",
});

User = new Ninja.Model({
  model_name: "user",
  url: function (id) {
    return BASE_URL + "/api/v1/user/" + id + "/";
  },
  static_url: BASE_URL + "/api/v1/user/"
});

notebooks_controller = {
  before_filters: {
    show: ["clearContent", "selectNotebook"]
  },

  show: function (params) {
    var id = params["id"];
    NoteBook.find(id, function (notebook) {
      var context = {notebook: notebook};
      Ninja.renderTemplate('#content', 'notebooks_show', context);
    });
  },
  putNoteBooks: function () {
    NoteBook.all(function (notebooks) {
      Ninja.renderTemplate("#sidebar",
                           "notebooks_index",
                           {notebooks: notebooks});
    });
  },
  new: function () {
    var template = Ninja.render("notebooks_new", {});
    $(template).modal(MODAL_OPTIONS);
  },
  save: function (params) {
    var notebook_id = params["notebook_id"];
    var name = $('#notebook_name').val();
    var attrs = {
      name: name,
      notes: [],
      id: notebook_id
    };

    _notebook = NoteBook.new(attrs);
    _notebook.save(function (notebook) {
      $("#notebook-form").remove();
      $(".modal-backdrop").remove();
      notebooks_controller.putNoteBooks()
      Ninja.changeHash("!/notebook/"+notebook.id+"/");
    });
  },
  edit: function (params) {
    var id = params["id"];

    NoteBook.find(id, function (notebook) {
      var context = {notebook: notebook};
      var template = Ninja.render("notebooks_edit", context);
      $(template).modal(MODAL_OPTIONS);
    });
  },
  delete: function (params) {
    var id = params["id"];

    NoteBook.new({id: id}).delete(function (data) {
      Ninja.changeHash("#!/");
      notebooks_controller.putNoteBooks();
    });
  },
}

notes_controller = {
  before_filters: {
    new: ["clearContent"],
    show: ["clearContent"]
  },
  new: function (params) {
    var notebook_id = params["notebook_id"];
    // Select notebook
    //notebook_id && select

    // Render note form content
    Ninja.renderTemplate("#content", 'notes_new', {});
    // Show share notes
    Ninja.renderTemplate("#share-note", 'partials_share_note', {});
    // Show notebook select dd
    NoteBook.all(function (notebooks) {
      var context = {
        notebooks: notebooks,
        notebook_id: notebook_id,
        note: undefined
      };
      Ninja.renderTemplate("#note_notebook_dd",
                           'partials_notebook_dd',
                           context);
    });
  },
  putNote: function (note) {
    var context = {note: note};
    // Render note content
    Ninja.renderTemplate("#content", "notes_show", context);
    // Show share note buttons
    Ninja.renderTemplate("#share-note", 'partials_share_note', {});
    NoteBook.all(function (notebooks) {
      Ninja.renderTemplate("#note_notebook_dd",
                           'partials_notebook_dd',
                           {notebooks: notebooks, note: note});
    });
  },
  show: function (params) {
    var id = params["id"];
    Note.find(id, function (note) {
      notes_controller.putNote(note);
    });
  },
  delete: function (params) {
    var id = params["id"];
    Note.new({id: id}).delete(function (data) {
      history.back();
    });
  },
  save: function () {
    var note = $('#content textarea');
    var notebook = $("#note_notebook_dd select").val();

    if (! notebook) {
      showFlashError("Please create a notebook first.");
      return ;
    }

    var attrs = {
      id: $(note).data("id"),
      content: $(note).val(),
      title: $("#note-title input").val(),
      notebook: NoteBook.url(notebook)
    };

    _note = Note.new(attrs);
    _note.save(function (note) {
      //notes_controller.putNote(note);
      Ninja.changeHash("!/note/"+note.id+"/", true);
      $("#note-content").data("id", note.id);
    });
  }
}
