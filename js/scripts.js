var challenge = {
	init: function () {
		console.log('initializing challenge...');
		this.buildOptions(this.optionData, 'options');
		this.buildTimeline(this.optionData, 'video__timeline');
		this.createEvents();
	},
	answers: [],
	score: 0,
	getOptions: function () {
		return document.querySelectorAll('.option__wrapper');
	},
	createEvents: function () {
		console.log('creating events...');
		
		// add options to an array
		var options = this.getOptions();
		
		// mouseEnter
		var mouseEnter = function (e) {
			// only executes on option if unused
			if (! e.classList.contains('empty')) {
				var img = e.getElementsByClassName('option__img')[0];
				// prevent image from changing to native size when dragged
		    var img_dim = img.getBoundingClientRect();
		    img.style.width = img_dim.width +'px';
		   	// switch to gif image
		    var gif_src = img.getAttribute('data-gif');
		    img.setAttribute('src', gif_src);
			}
	  };
	  
	  // mouseLeave
	  var mouseLeave = function (e) {
	  	// only executes on option if unused
	  	if (! e.classList.contains('empty')) {
		    var img = e.getElementsByClassName('option__img')[0];
		    // switch to static image
		    var static_src = img.getAttribute('data-static');
		    img.setAttribute('src', static_src);
		  }
	  };
	  
	  // mouseDown
	  var mouseDown = function (e) {
	  	// only executes on option if unused
	  	if (! e.classList.contains('empty')) {
		  	var img = e.getElementsByClassName('option__img')[0];
		  	// switch to static image
		    var static_src = img.getAttribute('data-static');
		    img.setAttribute('src', static_src);
		  	// mark option space as empty
		  	e.classList.add('empty');
		  	// get current mouse position
		  	var mouseX = event.clientX;
		    var mouseY = event.clientY;
		  	// set up the dragged option's properties
		  	var dragger = new (function(){
		  		this.element = e.getElementsByClassName('option__drag')[0];
		  		this.rectProps = this.element.getBoundingClientRect();
		  		// get center of option element
		  		this.offsetX = this.rectProps.width / 2;
		  		this.offsetY = this.rectProps.height / 2;
		  	})();
		    // center the dragged option to the current mouse position
		    dragger.element.style.left = mouseX - dragger.offsetX +'px';
		    dragger.element.style.top = mouseY - dragger.offsetY +'px';
		    // set up timeline and individual slot properties
		    var timeline = new (function(){
		    	this.element = document.getElementsByClassName('video__timeline')[0];
		    	this.rectProps = this.element.getBoundingClientRect();
		    	// get position of the left edge of the timeline
		    	this.leftOffset = this.rectProps.left;
		    	this.slots = document.querySelectorAll('.slot');
		    	this.slotRectProps = this.slots[0].getBoundingClientRect();
		    	// get the slot width
		    	this.slotWidth = this.slotRectProps.width;
		    })();
		   	
		   	// mouseMove
		    dragger.element.addEventListener('mousemove', function(event){
		    	// track current mouse position
		    	mouseX = event.clientX;
			    mouseY = event.clientY;
			    // center the dragged option to the current mouse position
			    this.style.left = mouseX - dragger.offsetX +'px';
			    this.style.top = mouseY - dragger.offsetY +'px';
			    // check if option has been dragged near the timeline
			   	if (mouseX > timeline.rectProps.left + 30 && mouseX < timeline.rectProps.right - 30 && mouseY > timeline.rectProps.top - 60 && mouseY < timeline.rectProps.bottom + 60) {
			   		// detect the closest slot position to the dragged option on the x-axis
			   		var currentSlot = Math.abs(Math.round(((mouseX - timeline.leftOffset) / timeline.slotWidth) - 0.5));
			   		// apply styling class to slot that is being hovered over and remove from other slots
			   		for(var s = 0; s < timeline.slots.length; s++){
			   			if(s == currentSlot){
			   				timeline.slots[s].classList.add('hoverSlot');
			   			} else {
			   				timeline.slots[s].classList.remove('hoverSlot');
			   			}
			   		}
			   	}
		    });
		  }
	  };
	  
	  // mouseUp
	  var mouseUp = function (e) {
	  	var hoverSlot = document.getElementsByClassName('hoverSlot')[0];
	  	if (hoverSlot) {
	  		// remove hover styling from slots
	  		hoverSlot.classList.remove('hoverSlot');
	  		// capture option's html and then remove it from option
	  		var optionInner = e.getElementsByClassName('option__drag')[0];
	  		var optionHTML = optionInner.innerHTML;
	  		e.innerHTML = '';
	  		// add option html to slot and mark as filled
	  		hoverSlot.classList.add('slot--filled');
	  		hoverSlot.getElementsByClassName('slot__img')[0].innerHTML = optionHTML;
	  		// grab option and slot's placement IDs
	  		var optionTarget = optionInner.getAttribute('data-target');
	  		var targetNum = hoverSlot.getAttribute('data-num');
	  		// check if option was placed in the correct slot or not and apply class accordingly
	  		if (optionTarget == targetNum) {
	  			hoverSlot.classList.add('slot--correct');
	  			var answerCorrect = true;
	  			
	  		} else {
	  			hoverSlot.classList.add('slot--incorrect');
	  			var answerCorrect = false;
	  		}
	  		// push answer to answer array
	  		challenge.answers.push({
	  			optionNum: optionTarget,
	  			targetNum: targetNum,
	  			correct: answerCorrect
	  		});
	  		// check if all slots have been filled
	  		if(challenge.answers.length == 7){
	  			challenge.complete();
	  		}
	  						  		
	  	} else {
	  		e.classList.remove('empty');
	  	}
	  };
	  
		// add all mouse events to individual options
		for (var i = 0; i < options.length; i++) {
		  options[i].addEventListener('mouseenter', function () { mouseEnter(this) });
		  options[i].addEventListener('mouseleave', function () { mouseLeave(this) });
		  options[i].addEventListener('mousedown', function () { mouseDown(this) });
		  options[i].addEventListener('mouseup', function () { mouseUp(this) });
		};
	},
	buildOptions: function (options, container) {
		console.log('building options...');
		var optionsContainer = document.getElementsByClassName(container)[0];
		// shuffle options
		var shuffledOptions = this.shuffle(options);
		shuffledOptions.map(function (option) {
			var optionHTML = '\
				<div class="option__wrapper">\
					<div class="option__drag option--'+ option.order +'" data-target="'+ option.order +'">\
						<img class="option__img option__img--'+ option.order +'" src="'+ option.static_src +'" data-static="'+ option.static_src +'" data-gif="'+ option.gif_src +'" draggable="false" />\
					</div>\
				</div>\
				<div class="option__desc">'+ option.desc +'</div>\
			';
			var optionContainer = document.createElement('div');
			optionContainer.className += 'one-half column option';
			optionContainer.innerHTML = optionHTML;
			optionsContainer.appendChild(optionContainer);
		});
	},
	buildTimeline: function (options, container) {
		console.log('building timeline...');
		var timeline = document.getElementsByClassName('video__timeline')[0];
		for (var i = 1; i <= this.optionData.length; i++) {
			var timelineSlot = '\
				<div class="slot slot--'+ (i - 1) +'" data-num="'+ (i - 1) +'">\
					<div class="slot__img"></div>\
					'+ i +'\
				</div>\
			';
			var slotContainer = document.createElement('div');
			slotContainer.innerHTML = timelineSlot;
			timeline.appendChild(slotContainer);
		}
	},
	shuffle: function (array) {
		console.log('shuffling options...');
	  var currentIndex = array.length, temporaryValue, randomIndex;
	  while (0 !== currentIndex) {
	    randomIndex = Math.floor(Math.random() * currentIndex);
	    currentIndex -= 1;
	    temporaryValue = array[currentIndex];
	    array[currentIndex] = array[randomIndex];
	    array[randomIndex] = temporaryValue;
	  }
	  return array;
	},
	complete: function () {
		document.getElementsByClassName('video__timeline')[0].classList.add('video__timeline--complete');
		for (var i = 0; i < this.answers.length; i++) {
			if (this.answers[i].correct) {
				this.score++;
			}
		}
		var scorePercent = (this.score / this.answers.length) * 100;
		
		this.sendScore(scorePercent);
		
		if (scorePercent > 80) {
			this.lessonComplete();
			if (scorePercent == 100) {
				this.playVideo();
			}
		} else {
			this.lessonIncomplete();
		}
	},
	sendScore: function (score, lessonID) {
		console.log('send score ('+ score +') to fathom');
		/*
		setScore(score, lessonID, function () {
			console.log('score sent');
		});
		*/
	},
	lessonComplete: function (lessonID) {
		console.log('mark lesson complete');
		/*
		setStatus('complete', lessonID, function () {
			console.log('lesson marked complete');
		});
		*/
	},
	lessonIncomplete: function (lessonID) {
		console.log('mark lesson incomplete');
		/*
		setStatus('incomplete', lessonID, function () {
			console.log('lesson marked incomplete');
		});
		*/
	},
	playVideo: function () {
		var challengeVideo = document.getElementById('challenge_video');
		challengeVideo.classList.add('unlocked');
		challengeVideo.play();
	},
	optionData: [
		{
			order: 0,
			desc: 'pour base',
			static_src: 'img/lemon_step_1_master.jpg',
			gif_src: 'img/lemon_step_1_master.gif'
		},
		{
			order: 1,
			desc: 'add water',
			static_src: 'img/lemon_step_2_master.jpg',
			gif_src: 'img/lemon_step_2_master.gif'
		},
		{
			order: 2,
			desc: 'add seal',
			static_src: 'img/lemon_step_3_master.jpg',
			gif_src: 'img/lemon_step_3_master.gif'
		},
		{
			order: 3,
			desc: 'fizz',
			static_src: 'img/lemon_step_4_master.jpg',
			gif_src: 'img/lemon_step_4_master.gif'
		},
		{
			order: 4,
			desc: 'add ice',
			static_src: 'img/lemon_step_5_master.jpg',
			gif_src: 'img/lemon_step_5_master.gif'
		},
		{
			order: 5,
			desc: 'pour contents',
			static_src: 'img/lemon_step_6_master.jpg',
			gif_src: 'img/lemon_step_6_master.gif'
		},
		{
			order: 6,
			desc: 'finish and connect',
			static_src: 'img/lemon_step_7_master.jpg',
			gif_src: 'img/lemon_step_7_master.gif'
		}
	]
};

(function () {
	challenge.init();
})();