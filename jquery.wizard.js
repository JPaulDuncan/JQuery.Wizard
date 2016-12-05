;
// Wizard
(function ($) {

    // Enable Strict Mode
    'use strict';

    // Plugin Default Settings
    var defaults = {

        // Callbacks
        onInit: function () {
        },
        onPrev: function () {
        },
        onNext: function () {
        },
        onOther: function () {
        },
        onFinish: function () {
        },
        onStart: function () {
        },
        onBeforeStep: function () {
        },
        onStep: function () {
        },
        disableOnfinish: true,
        fade: true,
        stepBar: {
            visible: true,
            type: 'breadcrumb',
            buttonClass: "btn navbar-btn btn-default",
            objectType: "button",
            useAnchor: true,
            useDivider: false,
            divider: '',
            dividerText: '',
            dividerClass: '',
            numberOfVisible: 2
        }
    };

    $.fn.wizard = function (options) {

        // Check to see if default options are Set
        if (typeof options === 'undefined') {
            options = {};
        }

        // Check to see if an element is even selected
        if (this.length === 0) return this;

        // Create Current wizard Object
        var wizard = {};
        var actions = {};
        var steps = {};
        var stepBar = {};

        if (this.length > 1) {
            wizard = this[0];
        }
        else {
            wizard = this;
        }

        var init = function () {

            // Check for HTML5 data attributes instead
            for (var key in defaults) {
                if (defaults.hasOwnProperty(key)) {
                    if (wizard.attr('data-wizard-' + key.toLowerCase())) {
                        options[key] = wizard.data(key.toLowerCase());
                    }
                }
            }

            var self = this, $self = $(this);

            // Merge Custom Plugin Settings with Default
            wizard.settings = $.extend({}, defaults, options);

            actions = wizard.find(".wizard-act");
            steps = wizard.find(".wizard-step");

            wizard.createStepBar();
            wizard._hideAll();

            actions.each(function () {
                // Register the click event for each action.
                $(this).on("click", null, function (evt) {

                    // Determine which action was clicked, call the corresponding function.
                    if ($(this).is('[data-action="next"]')) {
                        wizard._next.call(self, $(this));
                        return;
                    }
                    else if ($(this).is('[data-action="prev"]')) {
                        wizard._prev.call(self, $(this));
                        return;
                    }
                    else if ($(this).is('[data-action="finish"]')) {
                        wizard._finish.call(self, $(this));
                        return;
                    }
                    else if ($(this).is('[data-action="start"]')) {
                        wizard._start.call(self, $(this));
                        return;
                    }
                    else {
                        wizard._other.call(self, $(this));
                        return;
                    }
                });
            });

            wizard._start(self, null);

            $self.css("display", ""); // We're init'd so let's display

            wizard.settings.onInit();
        };

        wizard.createStepBar = function () {

            if (wizard.settings.stepBar.visible) {
                stepBar = wizard.find(".wizard-step-bar");

                var stepIndex = 1;
                var stepCount = steps.length;
                steps.each(function () {

                    // Only show if we are registered to do so.
                    if ($(this).attr("data-stepbar") != "false") {

                        var addDivider = false;

                        if (stepIndex < stepCount) {
                            addDivider = true;
                        }

                        wizard.createStepBarLink($(this).attr("data-step"), stepIndex, addDivider);

                        stepIndex++;
                    };

                });
            }
        }

        wizard.createStepBarLink = function (stepName, stepIndex, addDivider) {

            if (wizard.settings.stepBar.visible) {

                stepBar = wizard.find(".wizard-step-bar");

                if (stepBar) {

                    var step = steps.filter($('[data-step="' + stepName + '"]'));

                    if (step) {

                        var title = $($(step)).attr("data-step-bar-title");
                        if (!title) {
                            title = stepIndex;
                        }

                        var o = document.createElement(wizard.settings.stepBar.objectType);
                        $(o).addClass(wizard.settings.stepBar.buttonClass);
                        $(o).addClass("wizard-step-bar-button");

                        var dataTarget = $(step).attr("data-step");

                        if (wizard.settings.stepBar.useAnchor) {
                            var a = $(document.createElement("a"));

                            $(a).attr("href", "#");
                            $(a).attr("data-target", dataTarget);
                            $(a).html(title);

                            $(o).append(a);

                        }
                        else {
                            $(o).html(title);
                        }

                        if (wizard.settings.stepBar.useDivider) {
                            if (addDivider) {
                                var s = $(document.createElement(wizard.settings.stepBar.divider));
                                $(s).addClass("divider");
                                $(s).addClass(wizard.settings.stepBar.dividerClass);
                                $(s).html(wizard.settings.stepBar.dividerText);
                                $(o).append(s);
                            }
                        }

                        $(o).on("click", function () {
                            var clickTarget = $(this).attr("data-target");
                            wizard.jumpToStep(clickTarget, "other");
                            wizard.updateStepBar(clickTarget);
                        });

                        if (dataTarget) {
                            $(o).attr("data-target", dataTarget);
                        };

                        stepBar.append(o);
                    }
                }
            }
        };

        wizard.updateStepBar = function(stepName) {

            if (stepBar) {

                //wizard.settings.stepBar.objectType
                $(stepBar).find(wizard.settings.stepBar.objectType).each(function() {

                    $(this).removeClass("active");

                    // Show/hide parent steps
                    if ($(this).attr("data-target") == stepName) {
                        $(this).addClass("active");
                    };

                });
            };
        };

        wizard.jumpToStep = function (stepName, an) {

            // Find the step
            var targetStep = steps.filter('[data-step="' + stepName + '"]');

            // Hide all the steps
            wizard._hideAll();

            // Hide actions
            actions.filter("[data-show-on]").each(function() {
                var action = $(this).attr("data-action");
                var show = stepName == $(this).attr("data-show-on");
                if (action) {
                    wizard.displayAction(action, show);
                }
                else {
                    // Allows you to hide actions that have no actions defined.
                    $(this).css("display", show ? "" : "none");
                }
            });

            // Hide actions on a given step.
            actions.filter("[data-hide-on]").each(function() {
                var action = $(this).attr("data-action");
                var show = !(stepName == $(this).attr("data-hide-on"));
                if (action) {
                    wizard.displayAction(action, show);
                }
                else {
                    // Allows you to hide actions that have no actions defined.
                    $(this).css("display", show ? "" : "none");
                }
            });

            // Mark this step active
            targetStep.addClass("active");

            // Show the step (with optional fade effect)
            //wizard.settings.fade ? targetStep.fadeIn() :
          
            if (an) {
                if (an == "next" || an == "finish") {
                    $(targetStep).show('slide', { direction: 'left' });
                }
                else if (an == "prev" || an == "start") {
                    $(targetStep).show('slide', { direction: 'right' });
                }
                else if (an == "other") {
                    $(targetStep).show('slide', { direction: 'up' });
                }
                else {
                    targetStep.fadeIn();
                }
            }
            else {
                targetStep.fadeIn();
            }

            // Enable all the actions
            wizard.enableActions.call();

            // First step, disable start
            if ($(targetStep).is(steps.first())) {
                wizard.disableAction("start");
            };

            // Last step, disable finish, if enabled.
            if ($(targetStep).is(steps.last())) {
                if (wizard.settings.disableOnFinish) {
                    wizard.disableAction("finish");
                }
            };

            // No next step, disable action
            if (!$(targetStep).attr("data-step-next")) {
                wizard.disableAction("next");
            };

            // No prev step, disable action
            if (!$(targetStep).attr("data-step-prev")) {
                wizard.disableAction("prev");
            };

            // Inactivate actions
            actions.filter("[data-disable-until]").each(function() {
                wizard.disableAction($(this).attr("data-action"));
                var sn = $(this).attr("data-disable-until");
                if ($(targetStep).is(steps.filter('[data-step="' + sn + '"]'))) {
                    wizard.enableAction($(this).attr("data-action"), (stepName == sn));
                };
            });

            var actionName = $(targetStep).attr("data-action");
            var act = actions.filter('[data-action="' + actionName + '"]');

            wizard.updateStepBar(stepName);

            var parentTarget = $(act).attr("data-stepbar-step");
            if (parentTarget) {
                wizard.updateStepBar(parentTarget);
            }

            // Notify the onStep handler
            wizard.settings.onStep({stepName: stepName, actionName: actionName, action: act, step: targetStep, wiz: this});

            $(this).trigger('obelisk.wizard.show', {stepName: stepName, actionName: actionName, action: act, step: targetStep, wiz: this});

            return targetStep;

        };

        wizard.updateStep = function (stepName, targetAttribute, targetValue) {
            steps.filter('[data-step="' + stepName + '"]').attr(targetAttribute, targetValue);
        };

        wizard.displayAction = function (actionName, on, includeParent) {
            if (on == undefined) {
                on = false;
            }
            if (includeParent == undefined) {
                includeParent = false;
            }
            var action = actions.filter('[data-action="' + actionName + '"]');
            if (action) {
                action.css("display", on == true ? "" : "none");
            }
            if (includeParent) {
                action.parent("*").css("display", on == true ? "" : "none");
            }
        };

        // Disable all the actions
        wizard.disableActions = function () {
            actions.each(function () {
                $(this).attr("disabled", "disabled");
            });
        };

        // Enable all the actions
        wizard.enableActions = function () {
            actions.each(function () {
                $(this).removeAttr("disabled");
            });
        };

        // Disable a single action
        wizard.disableAction = function (actionName) {
            actions.filter('[data-action="' + actionName + '"]').attr("disabled", "disabled");
        };

        // Enable a single action
        wizard.enableAction = function (actionName) {
            actions.filter('[data-action="' + actionName + '"]').removeAttr("disabled");
        };

        wizard.jumpToAction = function (actionName) {
            $(actions.filter('[data-action="' + actionName + '"]')).trigger("click");
        };

        wizard._start = function (act) {
            var target = $(act).attr("data-target");
            if (target == undefined) {
                target = $(steps).first().attr("data-step");
            }

            wizard._show(target, "start", act, wizard.settings.onStart);
        };

        wizard._next = function (act) {
            wizard._show($(steps.filter(".active")).attr("data-step-next"), "next", act, wizard.settings.onNext);
        };

        wizard._prev = function (act) {
            wizard._show($(steps.filter(".active")).attr("data-step-prev"), "prev", act, wizard.settings.onPrev);
        };

        wizard._other = function (act) {

            var target = $(act).attr("data-target"), supress; // Supress means don't render a step target.
            if (!target) {
                supress = true;
                target = $(steps.filter(".active")).attr("data-step");
            }
            wizard._show(target, $(act).attr("data-action"), act, wizard.settings.onOther, supress);

            wizard._trigger('obelisk.wizard.other', act, $(act).attr("data-target"));
        };

        wizard._finish = function (act) {
            var target = $(act).attr("data-target");
            if (target == undefined) {
                target = $(steps).last().attr("data-step");
            }
            wizard._show(target, "finish", act, wizard.settings.onFinish);
        };

        wizard._hideAll = function () {
            steps.each(function () {
                $(this).hide();
                $(this).removeClass("active");
            });
        };

        wizard._trigger = function (eventName, act, target) {
            $(this).trigger(eventName, { action: act, target: target, wiz: this });
        };

        wizard._show = function (stepName, actionName, act, callback, suppressReload) {

            var targetStep = steps.filter('[data-step="' + stepName + '"]');

            var result = wizard.settings.onBeforeStep({ stepName: stepName, actionName: actionName, action: act, step: targetStep });
            if (result != undefined && !result) {
                return;
            }

            if (suppressReload == undefined || !suppressReload) {

                wizard.jumpToStep(stepName, actionName);
            }

            // callback
            if (callback) {
                callback({ stepName: stepName, actionName: actionName, action: act, step: targetStep, wiz: this });
            };
        };

        init(); // Initialize the wizard.

        // Return the wizard object.
        return wizard;
    };

}(jQuery));
