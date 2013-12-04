
surveyApp.factory('participantFactory', function ($http, $q) {
  var participantUrl = '/api/participant';
  var factory = {};
  var participant = {};
  factory.GetParticipant = function () {
    //get participant if not yet initialized
    var deferred = $q.defer();
    if (!participant.GMKey) {
      $http.get(participantUrl, {})
        .success(function(data) {
          if (data) {
            if (data.Status) {
              //if successful, return to app
              participant = { GMKey: data.GMKey, firstname: data.FirstName, lastname: data.LastName, rolename: data.RoleName, GRKey: data.GRKey };
              deferred.resolve(participant);
            } else {
              deferred.reject();
            }
          } else {
            deferred.reject();
          }
        })
        .error(function() {
          deferred.reject();
        });
    } else {
      deferred.resolve(participant);
    }

    return deferred.promise;
  };
  return factory;
});

surveyApp.factory('sectionFactory', function ($http, $q) {
  var sectionUrl = '/api/section/';
  var factory = {};
  var sections = [];

  factory.GetSectionCount = function (grKey) {
    var deferred = $q.defer();
    this.GetSections(grKey).then(function () {
        deferred.resolve(sections.length);
    });
    return deferred.promise;

  };
  factory.GetCurrentSection = function (grKey, idx) {
    var deferred = $q.defer();
    var index = parseInt(idx);
    this.GetSections(grKey).then(function () {
      if (index >= sections.length) {
        deferred.resolve(null);
      } else {
        deferred.resolve(sections[index]);
      }
    });
    return deferred.promise;

  };
  factory.GetNextSection = function (grKey, idx) {
    var deferred = $q.defer();
    var index = parseInt(idx);
    this.GetSections(grKey).then(function () {
      if ((index + 1) >= sections.length) {
        deferred.resolve(null);
      } else {
        deferred.resolve(sections[index + 1]);
      }
    });
    return deferred.promise;

  };
  factory.GetPrevSection = function (grKey, idx) {
    var deferred = $q.defer();
    var index = parseInt(idx);
    if (index > 0) {
      this.GetSections(grKey).then(function () {
        if ((index - 1) >= sections.length) {
          deferred.resolve(sections.pop());
        } else {
          deferred.resolve(sections[index - 1]);
        }
      });
    } else {
      deferred.resolve(null);
    }
    return deferred.promise;

  };
  factory.GetSectionByIndex = function (grKey, idx) {
    //get sections if not yet initialized
    var deferred = $q.defer();
    var index = parseInt(idx);
    var sectionCollectionUrl = sectionUrl + grKey;
    $http.get(sectionCollectionUrl, {})
      .success(function (data) {
        if (data) {
          if (data.Status) {
            //if successful, return to app
            sections = data.Sections;
            if (idx >= sections.length) {
              deferred.reject();
            } else {
              deferred.resolve(sections[index]);
            }
          } else {
            deferred.reject();
          }
        } else {
          deferred.reject();
        }
      })
      .error(function (err) {
        deferred.reject();
      });
    return deferred.promise;
  };

  //get sections if 
  factory.GetSections = function (grKey) {
    //get sections if not yet initialized
    var deferred = $q.defer();
    if (sections.length == 0) {
      var sectionCollectionUrl = sectionUrl + grKey;
      $http.get(sectionCollectionUrl, {})
        .success(function (data) {
          if (data) {
            if (data.Status) {
              //if successful, return to app
              sections = data.Sections;
              deferred.resolve();
            } else {
              deferred.reject();
            }
          } else {
            deferred.reject();
          }
        })
        .error(function (err) {
          deferred.reject();
        });
    } else {
      deferred.resolve();
    }

    return deferred.promise;
  };
  return factory;
});

surveyApp.factory('questionFactory', function ($http, $q, $window) {
  var questionUrl = '/api/question/';
  var logCheckUrl = '/api/AuthValidate/';
  var factory = {};
  var sectionQuestions = [];

  //get sections if 
  factory.GetSectionQuestions = function (grKey, gmKey, sectionId) {
    var deferred = $q.defer();

    //check existing sectionQuestions cache
    var currentQuestions = Enumerable.From(sectionQuestions)
      .Where(function (item) { return (item.sectionId == sectionId && item.GRKey == grKey); })
      .Select(function (item) { return item.questions; })
      .ToArray();

    //get sectionQuestions if not yet cached
    if (currentQuestions.length > 0 && currentQuestions[0].length > 0) {
      this.ConfirmAuth().then(function (authResult) {
        if (authResult) {
          deferred.resolve(currentQuestions[0]);
        } else {
          deferred.reject(); 
          $window.location.href = "/account/login";
        }
      });
        
    } else {
      var sectionQuestionUrl = questionUrl + sectionId + '/' + grKey + '/' + gmKey;
      $http.get(sectionQuestionUrl, {})
        .success(function (data) {
          if (data) {
            //if successful, return to app
            var sectionQuestion = { sectionId: sectionId, GRKey: grKey, questions: data };
            sectionQuestions.push(sectionQuestion);
            deferred.resolve(sectionQuestion.questions);
          } else {
            deferred.reject();
          }
        })
        .error(function (data, status, headers, config) {
          if (status == 401) {
            
          }
          deferred.reject(); //*******************************
          $window.location.href = "/account/login";
        });
    }

    return deferred.promise;
  };

  factory.ConfirmAuth = function() {
    var deferredAuth = $q.defer();

    $http.get(logCheckUrl, {})
      .success(function (data, status, headers, config) {
        if (status != 401) {
          deferredAuth.resolve(true);
        } else {
          deferredAuth.resolve(false);
        }
      })
      .error(function (data, status, headers, config) {
        if (status == 401) {
          deferredAuth.resolve(false);
        }
      });

    return deferredAuth.promise;
  };
  return factory;
});

surveyApp.factory('answerFactory', function ($http, $q) {
  var answerUrl = '/api/answer';
  var factory = {};

  //get sections if 
  factory.PostSectionAnswers = function (gmKey, grKey, sectionId, questions) {
    var deferred = $q.defer();

    //check existing sectionQuestions cache
    //var currentQuestions = JSLINQ(questions)
    //  .Where(function (item) { return (item.sectionId == sectionId && item.GRKey == grKey); })
    //  .Select(function (item) { return item.questions; });

    //get sectionQuestions if not yet cached
    if (questions && questions.length > 0) {
      //var sectionQuestionUrl = answerUrl + sectionId + '/' + grKey;
      //var currentAnswers = JSLINQ(questions).Select(function (item) { return { SsqKey: item.Id, Value: item.Answer.Value, SubAnswers: item.Answer.SubAnswers }; });
      var currentAnswersEnum = Enumerable.From(questions).Select(function (item) { return { SsqKey: item.Id, Value: item.Answer.Value, SubAnswers: item.Answer.SubAnswers }; });
      var currentAnswers = currentAnswersEnum.ToArray();
      var postData = { GRKey: grKey, GMKey: gmKey, SectionId: sectionId, Answers: currentAnswers };
      $http({
        url: answerUrl,
        method: "POST",
        data: postData
      }).success(function (data, status, headers, config) {
        //$scope.response = data; // assign  $scope.persons here as promise is resolved here 
        deferred.resolve(data);
      }).error(function (data, status, headers, config) {
        //$scope.response = status;
        deferred.resolve(data);
      });
      //deferred.resolve(postData);

      //$http.get(answerUrl, {})
      //  .success(function (data) {
      //    if (data) {
      //      //if (data.Status) {
      //      //if successful, return to app
      //      var sectionQuestion = { sectionId: sectionId, GRKey: grKey, questions: data };
      //      sectionQuestions.push(sectionQuestion);
      //      deferred.resolve(sectionQuestion.questions);
      //      //} else {
      //      //  deferred.reject();
      //      //}
      //    } else {
      //      deferred.reject();
      //    }
      //  })
      //  .error(function (err) {
      //    deferred.reject();
      //  });
    } else {
      deferred.reject();
    }

    return deferred.promise;
  };
  return factory;
});

surveyApp.factory('navigationPathFactory', function (sectionFactory, $q) {
  var factory = {};
  factory.GetNextPath = function (grkey, idx) {
    //get next section and set path
    var index = parseInt(idx);
    var deferred = $q.defer();
    sectionFactory.GetNextSection(grkey, index).then(function (nextsection) {
      if (nextsection == null) {
        //next section is confirm page
        deferred.resolve("#/survey/complete");
      } else {
        deferred.resolve("#/survey/" + nextsection.QuestionTypeStructure.TypeName + '/' + (index + 1) + '/' + nextsection.Id);
      }
    });

    return deferred.promise;
  };

  factory.GetPrevPath = function (grkey, idx) {
    //get prev section and set path
    var index = parseInt(idx);
    var deferred = $q.defer();
    if (index >= 0) {
      sectionFactory.GetPrevSection(grkey, idx).then(function(prevsection) {
        if (prevsection == null) {
          //prev section is welcome page
          deferred.resolve("#/survey/welcome");
        } else {
          deferred.resolve("#/survey/" + prevsection.QuestionTypeStructure.TypeName + '/' + (index - 1) + '/' + prevsection.Id);
        }
      });
    } else {
      deferred.resolve("/account/login");
    }

    return deferred.promise;
  };

  return factory;

});

surveyApp.factory('$exceptionHandler', function() {
  return function (exception, cause) {
    alert(exception.message);
  };
});

loginApp.factory('authenticationFactory', function ($http, $q, $window) {
  var loginUrl = '/account/login';
  var factory = {};
  var participant = {};
  factory.Login = function (email, returnUrl) {
    //get participant if not yet initialized
    var deferred = $q.defer();
      $http.post(loginUrl, { 'EmailAddress': email, 'ReturnUrl': returnUrl })
        .success(function (response) {
          if (response) {
            if (response.Status) {
              //if successful, return to app
              $window.location = '/survey/index';
              deferred.reject();
            } else {
              //this an error that was handled correctly by server
              if (response.ErrorMessage && response.ErrorMessage.length > 0) {
                deferred.resolve(response.ErrorMessage);
              } else {
                deferred.resolve("Unknown login error occurred.");
              }
            }
          } else {
            //this an error that was handled correctly by server
            if (response.ErrorMessage && response.ErrorMessage.length > 0) {
              deferred.resolve(response.ErrorMessage);
            } else {
              deferred.resolve("Unknown login error occurred.");
            }
          }
        })
        .error(function (response, status) {
          //this is an http error not handled by the server-side MVC app.
          if (response.ErrorMessage && response.ErrorMessage.length > 0) {
            deferred.resolve(response.ErrorMessage);
          } else {
            deferred.resolve("Unknown error occurred contacting Login Server. Code:"+status);
          }
        });

    return deferred.promise;
  };
  return factory;
});

