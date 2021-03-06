(function(angular, $, window, UriTemplate){

  'use strict';

  var $app = angular.module('SurvaiderForms', ['ui.slider','ngDraggable']);

  $app.controller('FormController', function($scope, $http, $rootScope){

    $scope.activeSlides = [];

    $scope.rendered = false;
    $scope.isOnQuestion = false;
    $scope.isAnimating = false;

    var backgroundColors = ['#fdc162', '#fd6a62', '#0ac2d2', '#7bb7fa', '#60d7a9'];

    $scope.getTheBackgroundColor = function(index){
      return '{ \'background-color\' : \'' + backgroundColors[index%backgroundColors.length]   + '\'}';
    }


    // $scope.sortableOptions = {
    //   stop: function(e, ui) {
    //     var rankingQuestion = $scope.activeSlide.question;
    //     rankingQuestion.completed();
    //   }
    // };

    $scope.rankingMobileSlider = {
         options: {
              stop: function (event, ui) {
                var index = ui.handle.parentElement.getAttribute('data-question-index'),
                    id = ui.handle.parentElement.getAttribute('data-question-id');
                    console.log(index);
                    console.log(id);
                    console.log();
                $scope.changeInQuestion(index, id);
                $scope.$apply();
              }
      }
    }

    $scope.onDropComplete = function (subparts, index, obj, evt) {
        var otherObj = subparts[index];
        var otherIndex = subparts.indexOf(obj);
        subparts[index] = obj;
        subparts[otherIndex] = otherObj;
        var rankingQuestion = $scope.activeSlide.question;
        rankingQuestion.completed();
        console.log(rankingQuestion.generateResponse());
    }

    function Slide(){
      this.slideType = '';
      this.element = null;
      this.question = null;
    }

    $scope.activeSlide = new Slide();

    function changeActiveSlideElement(element){
      $scope.activeSlide.element = element;
    }

    function changeActiveSlideType(type){
      $scope.activeSlide.slideType = type;
    }

    function changeActiveSlideQuestion(question){
      $scope.activeSlide.question = question;
    }

    $scope.$on('rendered', function(){
      $scope.rendered = true;

      $('#sv-app-loading').addClass('hide');

      changeActiveSlideType('header');
      changeActiveSlideElement($('#header-slide'));

      setupEventListeners();

    });

    function moveToNextPage(){
      var outPage = $scope.activeSlide,
          inPage = new Slide();
          inPage.slideType = 'question';
          inPage.question = $scope.questions[0];
          inPage.element = $('#question-' + inPage.question.id);

      movePages('down', outPage.element, inPage.element);
    }

    function movePages(direction, outPage, inPage){


      var endCurrPage = false, endNextPage = false;

      if ($scope.isAnimating) {
        return false;
      }

      inPage.addClass( 'sv-page-current' );

      var outClass = '',
          inClass = '';

      if (direction == 'down') {
        outClass = 'pt-page-moveToTop';
        inClass = 'pt-page-moveFromBottom';
      }
      else if (direction == 'up') {
        inClass = 'pt-page-moveFromTop';
        outClass = 'pt-page-moveToBottom';
      }

      $scope.isAnimating = true;

      outPage.addClass( outClass ).on( 'animationend', function(){

        outPage.off('animationend');
        endCurrPage = true;

        if ( endNextPage ) {
          endCurrPage = false;
          endNextPage = false;
          outPage.removeClass(outClass + ' sv-page-current sv-page-ontop');
          inPage.addClass('sv-page-current sv-page-ontop');
          $scope.isAnimating = false;
          inPage.removeClass(inClass);
        }

      } );

      inPage.addClass( inClass ).on( 'animationend', function(){

        inPage.off('animationend');
        endNextPage = true;

        if ( endCurrPage ) {
          endCurrPage = false;
          endNextPage = false;
          outPage.removeClass(outClass + ' sv-page-current sv-page-ontop');
          inPage.addClass('sv-page-current sv-page-ontop');
          $scope.isAnimating = false;
          inPage.removeClass(inClass);
        }

      } );



    }

    function changeIsOnQuestion(value){
      $scope.isOnQuestion = value;
    }

    $scope.paginate = function(question){
      if ($scope.rendered && !$scope.isAnimating) {
        if ((($scope.activeSlide.question == null || $scope.activeSlide.question != question) && question.isCompleted) || !question.isRequired) {
          var indexOfQuestion = $scope.questions.indexOf(question);
          moveToQuestion(question, indexOfQuestion);
        }
      }
    }

    function moveToQuestion(question, indexOfQuestion){

        var indexOfCurrQuestion = $scope.questions.indexOf($scope.activeSlide.question);

        changeIsOnQuestion(true);

        var newIndex = question.id;
        var newElement = $("#question-" + newIndex);

        if (indexOfQuestion > indexOfCurrQuestion) {

          if (!$scope.isAnimating) {
            movePages('down', $scope.activeSlide.element, newElement);
          }

        }

        else{

          if (!$scope.isAnimating) {
            movePages('up', $scope.activeSlide.element, newElement);
          }

        }

        changeActiveSlideType('question');
        changeActiveSlideElement(newElement);
        changeActiveSlideQuestion(question);
    }


    function moveToSlide(question){

    }

    $scope.moveHeaderSlide = function(){

      if ($scope.rendered) {
        movePages('down', $('#header-slide'), $('#question-' + $scope.questions[0].id));
      }

      changeIsOnQuestion(true);

      changeActiveSlideType('question');
      changeActiveSlideElement($('#question-' + $scope.questions[0].id));
      changeActiveSlideQuestion($scope.questions[0]);

    }

    $scope.moveToNext = function(question){


      if (question.type == "ranking") {
        question.completed();
      }

      if (!question.isCompleted && question.isRequired) {
        return false;
      }

      console.log(question);

      checkTheNumberOfRemainingQuestions();


      //Post a request to server for every question that is answered
      $http.post(payload_update_uri, JSON.stringify(question.generateResponse()));

      var index = -1;

      if (question.type == 'single_choice' || question.type == 'yes_no') {
        if (!("va" in question.next)) {
          var next = question.next[question.response];
          index = next;


          //Strictly for testing purpose becuase there can be more than
          //Two options
          var notAnsweredQuestionIndex = 0;

          if (question.response == 1) {
            notAnsweredQuestionIndex = question.next[2];
          }
          else{
            notAnsweredQuestionIndex = question.next[1];
          }

          $scope.questions.find(function(element){
            if (element.id == notAnsweredQuestionIndex) {
              element.isDisabled = true;
              element.isCompleted = false;
              element.resetResponse();
            }
          });

        }
        else{
          index = question.next["va"];
        }
      }
      else{
        index = question.next["va"];
      }

      var questionID = index;



      if (index == 'end') {
        index = '#footer-slide';
        changeIsOnQuestion(false);
        var newSlide = $(index);
        movePages('down', $('#question-' + question.id), newSlide);
        changeActiveSlideType('footer');
        changeActiveSlideQuestion(null);
        changeActiveSlideElement(newSlide);
        return;
      }
      else{
        index = "#question-" + index;
        changeIsOnQuestion(true);
      }


      var newSlide = $(index);

      movePages('down', $('#question-' + question.id), newSlide);

      changeActiveSlideElement(newSlide);


      $scope.questions.find(function(element){
        if (element.id == questionID) {
          changeActiveSlideQuestion(element);
        }
      });
    }

    function setupEventListeners(){
      if ($scope.activeSlide.element != null) {
        window.addEventListener('keydown', function(event){

            if (event.keyCode == 13 || event.keyIdentifier == 'Enter') {
              switch ($scope.activeSlide.slideType) {
                case 'header':

                  if (!$scope.isAnimating) {
                    $scope.moveHeaderSlide();
                  }

                  break;

                case "question":

                  if (!$scope.isAnimating) {
                    $scope.moveToNext($scope.activeSlide.question);
                  }

                default:
                  break;
              }

              $scope.$apply();
            }

            else{
              thereIsAKeyPress(event.keyCode);
              checkTheNumberOfRemainingQuestions();
            }

        });
      }
    };

    function thereIsAKeyPress(keyCode){
      if ($scope.activeSlide.question != null) {

        var q = $scope.activeSlide.question;

        switch (q.type) {
          case 'single_choice':

            var numberOfOptions = q.options.length,
                number = (keyCode-64);

            if (number > 0 && number <= numberOfOptions) {
              // a refers to 64+1 in keyCode
              var numberToString = number.toLocaleString();

              q.response = numberToString;
              q.checkIfCompleted();
              $scope.$apply();

            }



            break;

          case 'multiple_choice':

            var numberOfOptions = q.choices.length,
                number = keyCode-64,
                choiceNumber = number - 1;

            if (number > 0 && number <= numberOfOptions) {
              // a refers to 64+1 in keyCode

              q.choices[choiceNumber].checked = !q.choices[choiceNumber].checked;


              q.checkIfCompleted();

              $scope.$apply();

            }


            break;

          case 'rating':

            var ratingLength = 10,
                number = (keyCode-48);

            if (number == 0) {
              number = 10;
            }

            var initialResponse = parseInt(q.response);

            if (keyCode == 39) {

              if (!initialResponse) {
                number = 1;
              }
              else if((initialResponse > 0 && initialResponse < ratingLength)){
                var number = initialResponse + 1;
              }

            }
            else if(keyCode == 37 && (initialResponse > 1 && initialResponse <= ratingLength)){
              var number = initialResponse - 1;
            }


            if (number > 0 && number <= ratingLength) {
              // 1 refers to 48+1 in keyCode
              var numberToString = number.toLocaleString();

              q.response = numberToString;
              q.checkIfCompleted();

              $scope.$apply();
            }

            break;

          case 'yes_no':

            var numberOfOptions = 2,
                number = (keyCode-64);

            if (number > 0 && number <= numberOfOptions) {
              // a refers to 64+1 in keyCode
              var numberToString = number.toLocaleString();

              q.response = numberToString;
              q.checkIfCompleted();
              $scope.$apply();

            }

        }


      }
    }


    // REQUEST MARK
    var s_id = UriTemplate.extract("/survey/s:{s_id}/simple", window.location.pathname).s_id;
    var json_uri = UriTemplate.expand("/api/survey/{s_id}/deepjson", {s_id: s_id}),
    payload_update_uri = UriTemplate.expand("/api/survey/{s_id}/response", {s_id: s_id});

    $http.get(json_uri)
         .success(function(data, status, header, config){

           $scope.survey_title = data.survey_title;
           $scope.survey_description = data.survey_description;
           $scope.survey_footer = data.survey_footer;
           $scope.survey_logo = data.survey_logo;
           $scope.numberOfQuestionsRemaining = data.fields.length;

           $scope.questions = [];

           data.fields.forEach(function(question, index){
             switch (question.field_type) {
               case "short_text":
                  if(!question.field_options.validation) { question.field_options.validation = "text"; }
                 var tempQuestion = new ShortTextQuestion(question.label, question.required, question.cid, question.field_type, question.next, question.field_options.description, question.field_options.validation);
                 $scope.questions.push(tempQuestion);

                 break;
               case "long_text":
                 var tempQuestion = new LongTextQuestion(question.label, question.required, question.cid, question.field_type, question.next, question.field_options.description);


                 $scope.questions.push(tempQuestion);

                 break;

               case "yes_no":
                 var tempQuestion = new YesNoQuestion(question.label, question.required, question.cid, question.field_type, question.next, question.field_options.description);

                 for (var i = 0; i < question.field_options.options.length; i++) {
                   tempQuestion.insertOption(question.field_options.options[i]);
                 }

                 $scope.questions.push(tempQuestion);

                 break;

               case "multiple_choice":
                 var tempQuestion = new MultipleChoiceQuestion(question.label, question.required, question.cid, question.field_type, question.next, question.field_options.description);

                 for (var i = 0; i < question.field_options.options.length; i++) {
                   tempQuestion.insertChoice(question.field_options.options[i]);
                 }

                 $scope.questions.push(tempQuestion);

                 break;
               case "single_choice":
                 var tempQuestion = new SingleChoiceQuestion(question.label, question.required, question.cid, question.field_type, question.next, question.field_options.description);

                 for (var i = 0; i < question.field_options.options.length; i++) {
                   tempQuestion.insertOption(question.field_options.options[i]);
                 }

                 $scope.questions.push(tempQuestion);

                 break;
               case "group_rating":
                 var tempQuestion = new GroupRatingQuestion(question.label, question.required, question.cid, question.field_type, question.next, question.field_options.description);


                 for (var i = 0; i < question.field_options.options.length; i++) {
                   tempQuestion.insertSubpart(question.field_options.options[i]);
                 }

                 $scope.questions.push(tempQuestion);

                 break;
               case "ranking":
                 var tempQuestion = new RankingQuestion(question.label, question.required, question.cid, question.field_type, question.next, question.field_options.description);


                 for (var i = 0; i < question.field_options.options.length; i++) {
                   tempQuestion.insertSubpart(question.field_options.options[i], i);
                 }

                 $scope.questions.push(tempQuestion);

                 break;
               case "rating":
                 var tempQuestion = new RatingQuestion(question.label, question.required, question.cid, question.field_type, question.next, question.field_options.description);


                 $scope.questions.push(tempQuestion);

                 break;
               default:
                 break;
             }

           });

         });

        //Send a get request in beginning to start a session
        $http.get(payload_update_uri + '?new=true')
              .success(function(data, status, header, config){
         
                  console.log(data);
         
              }
          );

         $scope.$on('changeSidebar', function(event, index){
          updateSidebar(index);
         });

         $scope.updateSidebar = function(type){
           var sidebar = $('.sv-sidebar-wrapper'),
               messageEl = sidebar.find('.current-message h3');
           switch (type) {
             case 'short_text':
               messageEl.html('Minimum 10 Charaters');
               break;

             case 'long_text':
               messageEl.html('Minimum 40 Charaters');
               break;

             case 'single_choice':
               messageEl.html('Select one choice (Use a,b,c,... keys)');
               break;

             case 'multiple_choice':
               messageEl.html('Select as many as you want (Use a,b,c,... keys)');
               break;

             case 'group_rating':
               messageEl.html('Rate the individual subpart from 1 to 5');
               break;

             case 'rating':
               messageEl.html('Rate from 1 to 10 (Use number keys or left/right keys)');
               break;

             case 'ranking':
               messageEl.html('Rank the following');
               break;

             case 'yes_no':
               messageEl.html('Select yes or no (Use keys a or b)');
               break;

             default:
               if ($scope.activeSlide.slideType == 'header') {
                 messageEl.html('Let\'s get started!');
               }
               else if ($scope.activeSlide.slideType == 'footer') {
                 messageEl.html('Thank You!');
               }
               break;

           }
         }


         $scope.changeInQuestion = function(questionIndex, questionId){
           var question = $scope.questions[questionIndex],
           questionElement = $('#question-' + questionId);
           console.log(question);

           if (question.checkIfCompleted()) {
             questionElement.addClass('completed-question');
             checkTheNumberOfRemainingQuestions();
           }

           else{
             questionElement.removeClass('completed-question');
             checkTheNumberOfRemainingQuestions();
           }

         }

         function checkTheNumberOfRemainingQuestions(){
           var numberOfQuestionsRemaining = 0;
           $scope.questions.forEach(function(question){
             if (!question.isCompleted && !question.isDisabled && question.isRequired) {
                numberOfQuestionsRemaining++;
             }
           });
           $scope.numberOfQuestionsRemaining = numberOfQuestionsRemaining;
         }

         $scope.formSubmit = function(){
           var finalSlide = $('#final-slide');
           changeActiveSlideType('final');
           changeActiveSlideElement(finalSlide);
           checkTheNumberOfRemainingQuestions();
           movePages('down', $('#footer-slide'), finalSlide);

           //MARK :- TheFinalPostLink

          // $http.get('survey/' + s_id + '/response/finish'); <--- THIS IS NOT CORRECT.
           $http.get(payload_update_uri + '?new=false')
              .success(function(data, status, header, config){

                  console.log(data);

              }
          );
         }

         function generateTheJSON(){
           var json = {
             responses: []
           };
           $scope.questions.forEach(function(question){
             if (question.isCompleted && !question.isDisabled) {
               json.responses.push(question.generateResponse());
             }
           });
           return json;
         }

   });



   $app.filter('numberToAlphabet', function(){
    return function(input){
      return String.fromCodePoint(input + 97);
    }
  });

  $app.filter('makeArray', function(){
    return function(input, size){
      var array = [];
      for (var i = 0; i < size; i++) {
        array.push(i+1);
      }
      return array;
    }
  });

  $app.directive('svQuestionDirective', function(){
    return function(scope, element, attrs){

      if (scope.$last) {
        scope.$emit('rendered');
      }
    }
  });

  $('#fullscreen-trigger').click(function(ev){
    ev.preventDefault();

    var elem = document.getElementsByTagName("main")[0];
    if (elem.requestFullscreen) {
      elem.requestFullscreen();
    } else if (elem.msRequestFullscreen) {
      elem.msRequestFullscreen();
    } else if (elem.mozRequestFullScreen) {
      elem.mozRequestFullScreen();
    } else if (elem.webkitRequestFullscreen) {
      elem.webkitRequestFullscreen();
    }

  });

})(angular, $, window, UriTemplate);
