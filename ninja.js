Ninja = {
  renderTemplate: function (container, template_name, context) {
    var template_string = $('#template_'+template_name).html();
    var rendered = _.template(template_string)(context);
    $(container).html(rendered);
  },

  render: function (template_name, context) {
    var template_string = $('#template_'+template_name).html();
    return _.template(template_string)(context);
  },


  changeHash: function(hash, ignoreHashChange) {
    if (ignoreHashChange) {
      window.__ignoreHashChange = true;
    }
    window.location.hash = hash;
  },

  Model: function (options) {
    // Setting options
    var self = new Object;

    _.each(options, function (value, key) {
      self[key] = value;
    });

    self.new = function (attrs, callback) {
      var x = _.extend({}, self);
      attrs && (x.attr = attrs);
      x.self = x;
      callback && callback(x);
      return x;
    };

    self.validate = function () {
      _.each(this.schema, function (s_object, field) {
      });

      return true;
    };

    self.save = function (callback) {
      if (! this.validate()) {
        this.showValidationErrors();
        return false;
      }

      params = JSON.stringify(this.attr);

      var updated = this.attr.id != undefined ? true : false;
      var self = this;

      $.ajax( {
        url: updated ? this.url(this.attr.id) :this.static_url,
        type: updated ? "put" : "post",
        data: params,
        contentType:"application/json; charset=utf-8",
        //dataType: "json",
        success: function (data) {
          var name = capitalize(self.model_name);
          showFlashMessage(name + (updated ? " updated!" : " saved!"));
          callback && callback(data);
        },
        error: function (xhr, textStatus, error) {
        }
      });

      return true;
    };

    self.all = function (callback) {
      $.ajax({
        url: this.static_url,
        type: "get",
        success: function (data) {
          callback && callback(data.objects);
        },
        error: function (xhr, textStatus, error) {
        }
      })
    };

    self.delete = function (callback) {
      $.ajax({
        url: this.url(this.attr.id),
        type: "delete",
        success: function (data) {
          callback && callback(data);
        },
        error: function (xhr, textStatus, error) {
        }
      })
    }

    self.find = function (id, callback) {
      var url;
      if (_.isFunction(self.url))
        url = self.url(id);
      else url = self.url;

      if (! _.isFunction(callback)) {
        return false;
      }

      $.ajax ( {
        method: "get",
        url: url,
        async: true,
        success: function (data) {
          callback(data);
        }
      });
    };

    return self;
  }
}

/* Routing part */
$(document).ready(function() {
  _.each(ROUTES, function (route) {
    var controller = route[1].split("#")[0];
    var action = route[1].split("#")[1];

    Hasher.add(route[0], function (params) {
      var args = _.toArray(arguments)

      if (window.__ignoreHashChange == true) {
        window.__ignoreHashChange = undefined;
        return;
      }

      var c = window[controller+"_controller"];

      var filters = c.before_filters;
      var filter_type = "before_filters";

      if (filters != undefined && filters[action] != undefined) {
        if (! _.isArray(filters[action])) {
          filters[action] = [filters[action]];
        }

        _.each(filters[action], function (filter) {
          window[filter_type][filter](params);
        });
      }

      c[action](params);
    })
  });
  Hasher.setup();
});
