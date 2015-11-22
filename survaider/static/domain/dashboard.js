(function() {
  var DashboardHelper;

  DashboardHelper = {
    create_survey: function() {
      'use strict';
      var dat;
      dat = $('#survaider_form').serialize();
      $('#exec_create_survaider').attr('disabled', true).text('Processing');
      return $.ajax({
        type: 'POST',
        url: '/api/survey',
        data: dat
      }).done(function(data) {
        return swal({
          title: 'Built!',
          text: 'Proceed to adding the stuff.',
          type: 'success',
          confirmButtonText: 'Edit Structure',
          closeOnConfirm: true
        }, function() {
          $('#myModal').modal('hide');
          return window.open(data.uri_edit);
        });
      }).fail(function(data) {
        return swal({
          title: 'Error',
          type: 'error'
        });
      });
    },
    survey_tiles: {
      tile_template: "<div class=\"tile\">\n  <div class=\"panel-heading bg-master-light\">\n    <span class=\"h3 font-montserrat\"><%= dat.name %></span><br>\n    <small class=\"font-montserrat\">Modified <strong><span data-livestamp=\"<%= dat.last_modified %>\">(Loading)</span></strong></small><br>\n  </div>\n  <div class=\"panel-body bg-master-lightest\">\n    <small><span class=\"font-montserrat text-uppercase bold\">Status:</span></small>\n    <% if (!dat.is_active) { %>\n    <span class=\"label font-montserrat <% if (dat.has_expired){%>label-important<%}else{%>label-warning<%}%>\">\n      Inactive\n      <% if (dat.has_expired) { %>\n        &bullet; Expired\n      <% } %>\n      <% if (dat.is_paused) { %>\n        &bullet; Paused\n      <% } %>\n    </span>\n    <% } else { %>\n    <span class=\"label font-montserrat label-success\">Active</span>\n    <% } %>\n\n    <div class=\"row m-t-10 m-b-10\">\n      <div class=\"<% if (dat.has_response_cap === Math.pow(2,32)) {%>col-sm-12<% } else {%>col-sm-6<% } %> text-center label\">\n        <h5 class=\"font-montserrat no-margin text-uppercase\"><%= numeral(dat.has_obtained_responses).format('0[.]00a') %></h5>\n        <p class=\"font-montserrat no-margin text-uppercase hint-text\">Responses</p>\n      </div>\n      <% if (dat.has_response_cap === Math.pow(2,32)) { %>\n      <% } else {%>\n      <div class=\"col-sm-6 text-center label\">\n          <h5 class=\"font-montserrat no-margin text-uppercase\"><%= numeral(dat.has_response_cap).format('0[.]00a') %></h5>\n          <p class=\"font-montserrat no-margin text-uppercase hint-text\">Goal</p>\n      </div>\n      <% } %>\n    </div>\n\n    <span class=\"font-montserrat\">Stats, Modify or Share</span>\n    <div class=\"btn-group btn-group-sm btn-group-justified m-t-10 m-b-10\">\n      <a href=\"<%= dat.uri_responses %>\" class=\"btn btn-default\">\n        <i class=\"fa fa-star\"></i>\n        <span class=\"font-montserrat\">Analytics</span>\n      </a>\n      <a href=\"<%= dat.uri_edit %>\" class=\"btn btn-default\">\n        <i class=\"fa fa-star\"></i>\n        <span class=\"font-montserrat\">Edit</span>\n      </a>\n    </div>\n\n    <a href=\"<%= dat.uri_edit %>#share\"><span class=\"label font-montserrat\"><i class=\"fa fa-cog\"></i> <span class=\"font-montserrat\">Share</span></span></a>\n    <a href=\"<%= dat.uri_edit %>#settings\"><span class=\"label font-montserrat\"><i class=\"fa fa-cog\"></i> <span class=\"font-montserrat\">Settings</span></span></a>\n\n    <p class=\"font-montserrat m-t-10\">Preview</p>\n    <div class=\"btn-group btn-group-justified m-t-10\">\n      <div class=\"btn-group\">\n        <% if (dat.is_gamified) { %>\n          <a href=\"<%= dat.uri_game %>\" class=\"btn btn-primary\">\n        <% } else { %>\n          <a href=\"#\" class=\"btn btn-primary\" disabled>\n        <% } %>\n          <i class=\"fa fa-star\"></i>\n          <span class=\"font-montserrat\">Gamified</span>\n        </a>\n      </div>\n      <div class=\"btn-group\">\n        <a href=\"<%= dat.uri_simple %>\" class=\"btn btn-complete\">\n          <i class=\"fa fa-file-text-o\"></i>\n          <span class=\"font-montserrat\">Regular</span>\n        </a>\n      </div>\n    </div>\n  </div>\n</div>",
      template: "<div class=\"card <%= attrs.narrow %>\">\n  <section class=\"frontmatter\">\n    <h1><%= dat.name %></h1>\n    <small>\n      <span class=\"status-expanded\">\n        Modified <strong><span data-livestamp=\"<%= dat.last_modified %>\">(Loading)</span></strong>\n      </span>\n      <ul class=\"status-narrow\">\n        <li><i class=\"fa fa-circle-o idle\"></i>Active</li>\n        <li><i class=\"fa fa-rss alert\"></i>10 critical alerts</li>\n      </ul>\n    </small>\n\n    <ul class=\"statistics\">\n      <li>\n        <h1>Responses</h1>\n        <h2><%= numeral(dat.has_obtained_responses).format('0[.]00a') %></h2>\n      </li>\n      <li>\n        <% if (dat.has_response_cap !== Math.pow(2,32)) { %>\n        <h1>Goal</h1>\n        <h2><%= numeral(dat.has_response_cap).format('0[.]00a') %></h2>\n        <% } %>\n      </li>\n    </ul>\n    <a href=\"#\" class=\"more\"><i class=\"fa fa-arrow-circle-down\"></i>More</a>\n  </section>\n  <section class=\"status\">\n    <h1>\n      Status\n      <a href=\"#\" class=\"less\"><i class=\"fa fa-arrow-circle-up\"></i>Show Less</a>\n    </h1>\n\n    <ul>\n      <li><i class=\"fa fa-circle-o idle\"></i>Active</li>\n      <li><i class=\"fa fa-clock-o primary\"></i>Last modified <strong>2 hours ago</strong></li>\n      <li><i class=\"fa fa-rss alert\"></i>10 critical alerts</li>\n    </ul>\n  </section>\n  <section class=\"footer\">\n    <section class=\"destinations\">\n      <ul>\n        <a href=\"<%= dat.uri_responses %>\">\n          <li><i class=\"fa fa-area-chart\"></i> Analytics</li>\n        </a>\n        <a href=\"<%= dat.uri_edit %>\">\n          <li><i class=\"fa fa-edit\"></i> Edit</li>\n        </a>\n      </ul>\n    </section>\n    <section class=\"actions\">\n      <ul>\n        <li><a href=\"<%= dat.uri_edit %>#settings\"><i class=\"fa fa-cog\"></i> Settings</a></li>\n        <li><a href=\"<%= dat.uri_edit %>#share\"><i class=\"fa fa-share-alt\"></i> Share</a></li>\n        <li><a href=\"<%= dat.uri_edit %>#share\"><i class=\"fa fa-star\"></i> Preview</a></li>\n      </ul>\n    </section>\n  </section>\n</div>",
      init: function() {
        this.container = $('body');
        return this.container.masonry({
          columnWidth: 1,
          itemSelector: '.card',
          gutter: 10,
          isFitWidth: true
        });
      },
      append: function(dat) {
        var attrs, el, template;
        template = _.template(this.template);
        attrs = {
          narrow: dat.has_response_cap === Math.pow(2, 32) ? 'narrow' : ''
        };
        el = $(template({
          dat: dat,
          attrs: attrs
        }));
        this.container.append(el).masonry('appended', el, true);
        el.on('click', function() {
          if (el.hasClass('narrow')) {
            return el.find('a.more').click();
          }
        });
        el.find("a.more").on('click', (function(_this) {
          return function() {
            var reset;
            el.removeClass('narrow');
            reset = _.bind(function() {
              return _this.container.masonry();
            }, _this);
            _.delay(reset, 100);
            _.delay(reset, 300);
            return _.delay(reset, 600);
          };
        })(this));
        return el.find("a.less").on('click', (function(_this) {
          return function(e) {
            var reset;
            el.addClass('narrow');
            reset = _.bind(function() {
              return _this.container.masonry();
            }, _this);
            _.delay(reset, 100);
            _.delay(reset, 300);
            _.delay(reset, 600);
            return e.stopPropagation();
          };
        })(this));
      }
    }
  };

  $(document).ready(function() {
    DashboardHelper.survey_tiles.init();
    $.getJSON('/api/survey', function(data) {
      var dat, i, len, ref, results;
      ref = data.data.reverse();
      results = [];
      for (i = 0, len = ref.length; i < len; i++) {
        dat = ref[i];
        results.push(DashboardHelper.survey_tiles.append(dat));
      }
      return results;
    });
    return $('#survaider_form').submit(function(e) {
      e.preventDefault();
      return DashboardHelper.create_survey();
    });
  });

  window.DashboardHelper = DashboardHelper;

}).call(this);
