#ninja


Client side javascript framework to work with Django and Tastypie. Depends on underscore.js and jQuery.

## renderTemplate
    // Populates container with result generated from template template_name with context
    // container is jquery selector
    // template_name (dom element with id: template__[template_name] (without brackets) (preferably script[type=text/html]
    // context: dictionary with variables needed in template
    Ninja.renderTemplate(container, template_name, context)
    Ninja.renderTemplate("#content", "notebooks_index", {notebooks:notebooks})


## render
    // Same as renderTemplate but istead of populating container returns generated template
    Ninja.renderTemplate(template_name, context)
    Ninja.renderTemplate("noteoboks_index", {notebooks: notebooks})
    
  
## changeHash
    // Changes hashtag to one passed as parameter, ignoreHashChange (hashchange evt not fired)
    Ninja.changeHash(hash, ignoreHashChange);
    Ninja.changeHash("#/notebooks/", true);
    
    
# Routing
    // first is route path, other is controller#action (Rails like)
    ROUTES = [
      ["/notebooks/", "notebooks#index"],
      ["/notebook/:id/", "notebooks#show"],
    ]
    
# Controllers
    // Controllers are rails like (convention is name_controller)
    notebooks_controller = {
      before_filters: {
        show: ["clearContent"],
        index: ["clearContent"]
      },
      
      show: function (params) {
        console.log(params["id"]); // for /notebook/1/ => 1
      }
      
      index: function (params) {
        NoteBook.all(function (notebooks) {
          Ninja.renderTemplate("#sidebar", "notebooks_index", {notebooks: notebooks});
        })
      }
    }
    
# Views
    <script type="text/html" id="template_notebooks_index">
      <ul>
        <% _.each(notebooks, function (notebook) { %>
          <li data-id="<%= notebook.id %>"><%= notebook.name %></li>
        <% }) %>
      </ul>
    </script>
    
# Before filters
    // global before filters
    before_filters = {
      clearContent: function (params) {
        $("#content").html('');
      }
    }

# Model
    // Instantiate model
    // With tastypie static_url is used for index and create actions
    // url is used for show, update and delete actions
    NoteBook = new Ninja.Model({
      model_name: "notebook",
      url: function (id) {
        return BASE_URL + "/api/v1/notebook/" + id + "/";
      },
      static_url: BASE_URL + "/api/v1/notebook/",
    });

    // Instantiate model
    notebook = Notebook.new({
      name: "foobar"
    })
    
    console.log(notebook.attr.id) // => undefined
    console.log(notebook.attr.name) // => foobar
    
    // Save model
    notebook.save(function (notebook) {
      console.log(notebook.attr.id) // => 1
      console.log(notebook.attr.name) // => foobar
    })
 
    // Find model
    NoteBook.find(1, function (notebook) {
      console.log(notebook.attr.id); // => 1
      console.log(notebook.attr.name); // => // foobar
    })
    
    // Update model
    NoteBook.find(1, function (notebook) {
      notebook.attr.name="barfoo";
      notebook.save(function (notebook) {
        console.log(notebook.attr.id); // => 1
        console.log(notebook.attr.name); // => // barfoo
      })
    });
    
    
    // Delete notebook
    notebook.delete(function () {
    })
    
    // List all notebooks
    notebook.all(function (notebooks) {
      console.log(notebooks);
      /* [{id:1, name: "foobar"}, {id:2, name: "another dummy name"}] */
    })
    
