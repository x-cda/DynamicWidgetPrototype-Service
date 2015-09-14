var app = angular.module('container', ['app']);

app.controller('MainCtrl', function($scope, $compile, AsyncScriptContentLoader) {
    this.widgetId = "qeaZ4V0NWu0";
    this.domainName = "localhost:8080";

  this.addWidgets = function($event) {
      var widgetTag = this.widgetId;
      var domain = this.domainName;
      AsyncScriptContentLoader.load(widgetTag, domain).then(function(){
          var widgetIDPrc =  "wgt" + widgetTag.toLowerCase().replace("_", "") + "-wgt";
          var el = angular.element($event.target || $event.srcElement), newEl = angular.element('<' + widgetIDPrc + '></' + widgetIDPrc + '>');
          el.after(newEl);
          el.after("<br/>");
          $compile(newEl)(el.scope());
      });
  };
});

app.service('AsyncScriptContentLoader', function($q, $rootScope, $http) {
    var content = {};

    var getWidgetName = function(fileName) {
        var widgetIDPrc = fileName.toLowerCase().replace("_", "");

        return "wgt" + widgetIDPrc + "Wgt";
    };

    var directiveTemplate = 'window.Container.directive("WIDGET_NAME",function(){' +
            'PRIVATE_SECTION' +
            //'};' +
            'return {' +
                'PUBLIC_SECTION' +
                "," +
                "link:function(scope,element,attrs){" +
                    "scope.widgetName = widgetName;" +
                "}" +
            "}" +
        '});';

    var processWidgetContent = function(contents, widgetTag) {
        var js = {"PVT":"var widgetName = \"" + widgetTag + "\";","PLC":"\"restrict\":\"E\""};//contents.javascript;
        var html = contents.html;
        var css = contents.css;


        js.PLC +=', "template":"' + html + '"';

        var directive = directiveTemplate.replace("PUBLIC_SECTION", js.PLC);
        directive = directive.replace("PRIVATE_SECTION", js.PVT);
        directive = directive.replace("WIDGET_NAME", getWidgetName(widgetTag));

        return directive;
    };

    var loadContentAsync = function(widgetTag, domain) {
        var src = "http://" + domain + "/rest/web/json?id=" + widgetTag;//fetchTestDir() + widgetTag + ".json";
        if(!content[src]){
            var deferred = $q.defer(), self = this;
            var script = document.createElement('script'), run = false;
            var onLoadSuccess = function(object) {
                if( !run && (!self.readyState || self.readyState === 'complete') ){
                    run = true;

                    if(object && object.data) {
                        script.innerHTML = processWidgetContent(object.data, widgetTag);
                    }

                    deferred.resolve('Script ready: ' + src);
                    $rootScope.$digest();
                }
            };

            $http.get(src, {headers: {'Authorization': 'Bearer ' + window.keycloak.token}}).then(onLoadSuccess, function() {
                alert("Invalid widget request or domain unavailable....");
                content[src] = null;
            });

            document.body.appendChild(script);

            content[src] = deferred.promise;

        }

        return content[src];
    };

    return {
        load : loadContentAsync
    }
});

app.config(function($compileProvider){
  
  window.Container = {
    directive:function(){
       $compileProvider.directive.apply(null,arguments);
    }
  };
});
