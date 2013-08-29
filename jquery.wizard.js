/*
       jQuery Wizard Plugin 1.0.0

       Released into Public Domain by J Paul Duncan (jpaulduncan@gmail.com)

       http://github.com/JPaulDuncan/JQuery.Wizard
       
       Usage:
       JavaScript Call:  $("#myWizard").wizard();
       JavaScript Call with settings: $("#myWizard").wizard({disableOnFinish:true, onOther : function(e){ alert(e.target); alert(e.action); });

       Example:  
       <div id="myWizard">
        <div class="wizard-step" data-step="1" data-step-next="2">Step one</div>
        <div class="wizard-step" data-step="2" data-step-next="3" data-step-prev="1">Step Two</div>
        <div class="wizard-step" data-step="3" data-step-prev="2">Step Three</div>
        <div class="wizard-step" data-step="4" data-step-prev="2" data-step-next="3">Special Step</div>
        <div>
            <button class="wizard-btn" data-target="1" data-action="start">Start</button>
            <button class="wizard-btn" data-action="prev">Previous</button>
            <button class="wizard-btn" data-action="next">Next</button>
            <button class="wizard-btn" data-target="4" data-action="specialAction">Go Special</button>
            <button class="wizard-btn" data-target="3" data-action="finish">Finish</button>
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

                // Load all the buttons
                methods._buttons = self.find(".wizard-btn");

                // Load the steps
                methods._steps = self.find(".wizard-step"); 

                // Hide all of the steps.
                methods._hideAll();

                // Set up the click handler for the buttons
                methods._buttons.each(function () {

                    // Register the click event for each button.
                    $(this).on("click", null, function (evt) {

                        // Determine which button was clicked, call the corresponding function.
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

                // Callback onInit
                if (this.options.onInit && this.options.onInit != undefined) {
                    this.options.onInit(this)
                }
            })
        },
        firstStep: null,
        hideAction: function (actionName, on, includeParent) {
            if (on == undefined) { on = false; }
            if (includeParent == undefined) { includeParent = false; }
            var action = methods._buttons.filter('[data-action="' + actionName + '"]');
            if (action) {
                action.css("display", on == true ? "" : "none");
                if (includeParent) {
                    action.parent("*").css("display", on == true ? "" : "none");
                }
            }
        },
        // Disable all the buttons
        disableButtons: function () {
            methods._buttons.each(function () {
                $(this).attr("disabled", "disabled");
            });
        },
        // Enable all the buttons
        enableButtons: function () {
            methods._buttons.each(function () {
                $(this).removeAttr("disabled");
            });
        },
        _steps: null, // Steps
        _buttons: null, // Buttons
        jumpToAction: function (actionName) {
            $(methods._buttons.filter('[data-action="' + actionName + '"]')).trigger("click");
        },
        // Start action
        _start: function (btn) {
            var target = methods._buttons.filter('[data-action="start"]').attr("data-target");

            // If target isn't defined, just use the first step on the page.
            if (target == undefined) {
                target = $(methods._steps).first().attr("data-step");
            }

            if (btn) {
                target = $(btn).attr("data-target");
            }

            methods.firstStep = $(target);

            methods._show.call(this, target, "start", btn, this.options.onStart);
            
        },
        
        // Next action 
        _next: function (btn) {
            methods._show.call(this, $(methods._steps.filter(".active")).attr("data-step-next"), "next", btn, this.options.onNext);
        },

        // Prev action
        _prev: function (btn) {
            methods._show.call(this, $(methods._steps.filter(".active")).attr("data-step-prev"), "prev", btn, this.options.onPrev);
        },

        // Other action
        _other: function (btn) {
            methods._show.call(this, $(btn).attr("data-target"), $(btn).attr("data-action"), btn, this.options.onOther);
        },

        // Finish action
        _finish: function (btn) {
            methods._show.call(this, $(btn).attr("data-target"), "finish", btn, this.options.onFinish);
        },

        // hide all steps
        _hideAll: function () {
            methods._steps.each(function () {
                $(this).hide(); $(this).removeClass("active");
            });
        },

        _show: function (target, action, button, callback) {

            // If we don't have a target, then just callback.
            if ((!target) || target == undefined) {
                if (callback && callback != undefined) {
                    callback({ target: target, action: action, button: button })
                };
                return;
            }
            
            // Find the step
            var targetStep = methods._steps.filter('[data-step="' + target + '"]');

            // Hide all the steps
            methods._hideAll.call();

            // Mark this step active
            targetStep.addClass("active");

            // Show the step (with optional fade effect)
            this.options.fadeOn ? targetStep.fadeIn() : targetStep.show();

            // Enable all the buttons
            methods.enableButtons.call();

            // First step, disable start
            if ($(targetStep).is(methods._steps.first())) {
                $(this).find('.wizard-btn[data-action="start"]').attr("disabled", "disabled");
            };

            // Last step, disable finish, if enabled.
            if ($(targetStep).is(methods._steps.last())) {
                if (this.options.disableOnFinish) {
                    $(this).find('.wizard-btn[data-action="finish"]').attr("disabled", "disabled");
                }
            };

            // No next step, disable button
            if (!$(targetStep).attr("data-step-next")) {
                $(this).find('.wizard-btn[data-action="next"]').attr("disabled", "disabled");
            }

            // No prev step, disable button
            if (!$(targetStep).attr("data-step-prev")) {
                $(this).find('.wizard-btn[data-action="prev"]').attr("disabled", "disabled");
            }

            // callback
            if (callback && callback != undefined) {
                callback({ target: target, action: action, button: button })
            }; 

            // Notify the onStep handler
            if (this.options.onStep && this.options.onStep != undefined) {
                this.options.onStep({ target: target, action: action, button: button })
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
        onStep: undefined,
        disableOnFinish: true,
        fadeOn: true
    }
})(jQuery);