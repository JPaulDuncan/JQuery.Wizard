/*
       jQuery Wizard Plugin 1.0.3

       Released into Public Domain by J Paul Duncan (jpaulduncan@gmail.com)

       http://github.com/JPaulDuncan/JQuery.Wizard
       
       Usage:
       JavaScript Call:  $("#myWizard").wizard();
       JavaScript Call with settings: $("#myWizard").wizard({disableOnFinish:true, onOther : function(e){ alert(e.target); alert(e.actionName); });

       Example:  
       <div id="myWizard">
        <div class="wizard-step" data-step="1" data-step-next="2">Step one</div>
        <div class="wizard-step" data-step="2" data-step-next="3" data-step-prev="1">Step Two</div>
        <div class="wizard-step" data-step="3" data-step-prev="2">Step Three</div>
        <div class="wizard-step" data-step="4" data-step-prev="2" data-step-next="3">Special Step</div>
        <div>
            <button class="wizard-act" data-target="1" data-action="start">Start</button>
            <button class="wizard-act" data-action="prev">Previous</button>
            <button class="wizard-act" data-action="next">Next</button>
            <button class="wizard-act" data-target="4" data-action="specialAction">Go Special</button>
            <button class="wizard-act" data-target="3" data-action="finish">Finish</button>
        </div>
       </div>
       
       <script type="text/javascript">
        $(document).ready(function () { $('#myWizard').wizard(); } );
       </script>

       */
(function ($) {

    var methods = {
        // Initializes the wizard with the given or default settings.
        init: function (settings) {
            return this.each(function () {

                // Set the options
                this.options = $.extend({}, $.fn.wizard.defaults, settings); 

                // Helper pointers
                var me = this, self = $(this); 

                // Load all the actions
                methods._actions = self.find(".wizard-act");

                // Load the steps
                methods._steps = self.find(".wizard-step"); 

                // Hide all of the steps.
                methods._hideAll();

                // Set up the click handler for the actions
                methods._actions.each(function () {

                    // Register the click event for each action.
                    $(this).on("click", null, function (evt) {

                        // Determine which action was clicked, call the corresponding function.
                        if ($(this).is('[data-action="next"]')) {
                            methods._next.call(me, $(this));
                            return;
                        }
                        else if ($(this).is('[data-action="prev"]')) {
                            methods._prev.call(me, $(this));
                            return;
                        }
                        else if ($(this).is('[data-action="finish"]')) {
                            methods._finish.call(me, $(this));
                            return;
                        }
                        else if ($(this).is('[data-action="start"]')) {
                            methods._start.call(me, $(this));
                            return;
                        }
                        else {
                            methods._other.call(me, $(this));
                            return;
                        }
                    })
                });

                // Start the wizard.
                methods._start.call(me, null);


                $(this).css("display", ""); // We're init'd so let's display
                
                // Callback onInit
                if (this.options.onInit && this.options.onInit != undefined) {
                    this.options.onInit(this)
                }
            })
        },
        firstStep: null,
        displayAction: function (actionName, on, includeParent) {
            if (on == undefined) { on = false; }
            if (includeParent == undefined) { includeParent = false; }
            var action = methods._actions.filter('[data-action="' + actionName + '"]');
            if (action) {
                action.css("display", on == true ? "" : "none");
                if (includeParent) {
                    action.parent("*").css("display", on == true ? "" : "none");
                }
            }
        },
        // Disable all the actions
        disableActions: function () {
            methods._actions.each(function () {
                $(this).attr("disabled", "disabled");
            });
        },
        // Enable all the actions
        enableActions: function () {
            methods._actions.each(function () {
                $(this).removeAttr("disabled");
            });
        },
        // Disable a single action
        disableAction: function (actionName) {
            methods._actions.filter('[data-action="' + actionName + '"]').attr("disabled", "disabled");
        },
        // Enable a single action
        enableAction: function (actionName) {
            methods._actions.filter('[data-action="' + actionName + '"]').removeAttr("disabled");
        },
        _steps: null, // Steps
        _actions: null, // Actions
        jumpToAction: function (actionName) {
            $(methods._actions.filter('[data-action="' + actionName + '"]')).trigger("click");
        },
        // Start action
        _start: function (act) {
            var target = methods._actions.filter('[data-action="start"]').attr("data-target");

            // If target isn't defined, just use the first step on the page.
            if (target == undefined) {
                target = $(methods._steps).first().attr("data-step");
            }

            if (act) {
                target = $(act).attr("data-target");
            }

            methods.firstStep = $(target);

            methods._show.call(this, target, "start", act, this.options.onStart);
            
        },
        
        // Next action 
        _next: function (act) {
            methods._show.call(this, $(methods._steps.filter(".active")).attr("data-step-next"), "next", act, this.options.onNext);
        },

        // Prev action
        _prev: function (act) {
            methods._show.call(this, $(methods._steps.filter(".active")).attr("data-step-prev"), "prev", act, this.options.onPrev);
        },

        // Other action
        _other: function (act) {
            var target = $(act).attr("data-target"), supress;
            if ((!target) || target == undefined) { supress = true; target = $(methods._steps.filter(".active")).attr("data-step"); }
            methods._show.call(this, target, $(act).attr("data-action"), act, this.options.onOther, supress);
        },

        // Finish action
        _finish: function (act) {
            methods._show.call(this, $(act).attr("data-target"), "finish", act, this.options.onFinish);
        },

        // hide all steps
        _hideAll: function () {
            methods._steps.each(function () {
                $(this).hide();
                $(this).removeClass("active");
            });
        },

        _show: function (stepName, actionName, act, callback, suppressReload) {

            if (this.options.onBeforeStep != undefined) {
                var result = this.options.onBeforeStep({ stepName: stepName, actionName: actionName, action: act, step: targetStep });
                if (result != undefined && !result) { return; } 
            }

            if (suppressReload == undefined || !suppressReload) {
                // Find the step
                var targetStep = methods._steps.filter('[data-step="' + stepName + '"]');

                // Hide all the steps
                methods._hideAll.call();

                // Hide actions
                methods._actions.filter("[data-hide-until]").each(function () {
                    methods.displayAction($(this).attr("data-action"), (stepName == $(this).attr("data-hide-until")));
                });

                // Mark this step active
                targetStep.addClass("active");

                // Show the step (with optional fade effect)
                this.options.fadeOn ? targetStep.fadeIn() : targetStep.show();

                // Enable all the actions
                methods.enableActions.call();

                // First step, disable start
                if ($(targetStep).is(methods._steps.first())) { methods.disableAction("start"); };

                // Last step, disable finish, if enabled.
                if ($(targetStep).is(methods._steps.last())) {
                    if (this.options.disableOnFinish) { methods.disableAction("finish"); }
                };

                // No next step, disable action
                if (!$(targetStep).attr("data-step-next")) { methods.disableAction("next"); }

                // No prev step, disable action
                if (!$(targetStep).attr("data-step-prev")) { methods.disableAction("prev"); }

                // Notify the onStep handler
                if (this.options.onStep && this.options.onStep != undefined) {
                    this.options.onStep({ stepName: stepName, actionName: actionName, action: act, step: targetStep })
                };
            }

            // callback
            if (callback && callback != undefined) {
                callback({ stepName: stepName, actionName: actionName, action: act, step: targetStep })
            }; 
        }
    };

    // Plugin hook
    $.fn.wizard = function (methodName) {
        if (methods[methodName]) {
            return methods[methodName].apply(this, Array.prototype.slice.call(arguments, 1));
        }
        else if (typeof methodName === 'object' || !methodName) {
            return methods.init.apply(this, arguments);
        }
        else {
            $.error('Method ' + methodName + ' does not exist!');
        }
    };

    // Plugin defaults
    $.fn.wizard.defaults = {
        onInit: undefined,
        onPrev: undefined,
        onNext: undefined,
        onOther: undefined,
        onFinish: undefined,
        onStart: undefined,
        onBeforeStep: undefined, 
        onStep: undefined,
        disableOnFinish: true,
        fadeOn: true
    }
})(jQuery);