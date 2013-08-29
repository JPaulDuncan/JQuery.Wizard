JQuery.Wizard
=============

# Overview

JQuery.Wizard is a plugin that will enable you to quickly create a wizard-like flow from data-* attributes.

## Installation

Download `jquery.wizard.js` or `jquery.wizard.min.js` and reference it in your project.

```
<script type="text/javascript" src="/Scripts/jquery.wizard.min.js"></script>
```

Set up your wizard element.

```
<div id="myWiz"></div>
```

Assign to plugin:

```
 $(document).ready(function () {$("#myWiz").wizard()});

```

Set up the wizard steps:

```
<div id=#myWiz">
   <div class="wizard-step" data-step="first-step" data-step-next="second-step">First Step</div>
   <div class="wizard-step" data-step="second-step" data-step-prev="first-step" data-step-next="third-step">Second Step</div>
   <div class="wizard-step" data-step="third-step" data-step-prev="second-step">Third Step</div>
</div>
```

Set up the wizard buttons:

```
<button class="wizard-btn" data-action="start">Start</button>
<button class="wizard-btn" data-action="prev">Previous</button>
<button class="wizard-btn" data-action="next">Previous</button>
<button class="wizard-btn" data-action="finish">Finish</button>
```

That's it!

## Custom Buttons

You can create buttons that can jump to different steps:

```
<button class="wizard-btn" data-action="my-special-action" data-target="second-step>Jump to 2</button>
```

## Options

There are a few options available.

```
$(document).ready(function () {
   $("#myWiz").wizard({
      onInit: function(){ 
         alert('The wizard is done initializing'); 
      },
      onStep: function(data) { 
         // This is fired after a step is shown.
         alert('The target step is: ' + data.target); 
         alert('The action is: ' + data.action);
      },
      onStart: function(data) {
         alert('The target step is: ' + data.target); 
         alert('The action is: ' + data.action);
      },
      onFinish: function(data) {
         alert('The target step is: ' + data.target); 
         alert('The action is: ' + data.action);
      },
      onPrevious: function(data) {
         alert('The target step is: ' + data.target); 
         alert('The action is: ' + data.action);
      },
      onNext: function(data) {
         alert('The target step is: ' + data.target); 
         alert('The action is: ' + data.action);
      },
      onOther: function(data) {
         // This is fired when any "custom" button is clicked.
         alert('The target step is: ' + data.target); 
         alert('The action is: ' + data.action);
      },
      disableOnFinish: true, // Disables all the buttons when finish is clicked.
      fadeOn: true // Fade out/in on step change
   })
});
```

## Methods

There are a couple of methods available.

```
$("#myWiz").wizard("hideAction", "start", true); // Hides the start button.
$("#myWiz").wizard("hideAction", "start", false); // Shows the start button.
```

```
$("#myWiz").wizard("disableButtons"); // Disables all buttons.
$("#myWiz").wizard("enableButtons"); // Enables all buttons.
```

## Notes

1. Excluding ```data-step-next``` will disable the Next button.
2. Excluding ```data-step-prev``` will disable the Prev button.
3. You can indicate ``data-target``` on any button.
4. If you exclude ```data-target``` on a ```data-action="start"``` button, it will go to the first step automatically.
5. You can use any unique key for ```data-step```, it doesn't have to be a number.
6. If you exclude ```data-target``` on any button, it will not navigate the wizard, but it will raise the ```onOther``` event.  You can use this event handler to do a specific action.
