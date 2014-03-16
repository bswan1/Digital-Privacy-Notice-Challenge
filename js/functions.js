var bheight, cwidth, $container, ismobile;
	
	jQuery(document).ready(function($) {
		$container = $('.works_list ul');
			$container.isotope({
			  onLayout: function() {
			   $.waypoints('refresh');
			  }
			});

 		
		setstage();
		
  
		var stickyScroll = function(){  
			var scrollTop = $(window).scrollTop(); 
			console.log(scrollTop); 
				   
			if (scrollTop > 200) {   
				$('.scroll_info').addClass('hide');  
			} else {  
				$('.scroll_info').removeClass('hide');   
			}  
		};  
			  
		stickyScroll();  
		  
		$(window).scroll(function() {  
			stickyScroll();  
		});  
		
		$(window).smartresize(function(){
			setstage();
		});
		$(".main_nav a, .logo_cont a").click(function(event){
			//$(this).parent().parent().find('a').removeClass('active');
			//$(this).addClass('active');
			event.preventDefault();
			if(!ismobile){
			 	$('html,body').animate({scrollTop:$(this.hash).offset().top}, 500);
			}else{
				$('html,body').animate({scrollTop:$(this.hash).offset().top-50}, 500);
			}
			
		});
		
		$('.about, .works, .services, .team, .contact').waypoint(function() {
		  	activenav($(this));
		}, { offset: function() {
			return -$(this).height()+56;
		  }});
		$('.about, .works, .services, .team, .contact').waypoint(function() {
		  	activenav($(this));
		}, { offset: '55px' });
		$('.about, .works, .services, .team, .contact').waypoint(function() {
		  	$(this).removeClass('active');
		}, { offset: '76%' });
		$('.about, .works, .services, .team, .contact').waypoint(function() {
		  	$(this).addClass('active');
		}, { offset: '75%' });
		$('.about, .works, .services, .team, .contact').waypoint(function() {
		  	$(this).removeClass('active');
		}, { offset: function() {
			return -$(this).height()+200;
		  }});
		$('.about, .works, .services, .team, .contact').waypoint(function() {
		  	$(this).addClass('active');
		}, { offset: function() {
			return -$(this).height()+250;
		  }});
		  
		  //button click operation
		  $('#menu-button').click(function(){
			$('#main_nav').toggleClass("collapse"); 
			 $('.sidefoot').toggleClass("sidefoot_collapse"); 
		 
		  });
		  $(".main_nav a").click(function(event){

				event.preventDefault();
				$('#main_nav').addClass("collapse"); 
				$('.sidefoot').addClass("sidefoot_collapse");
				
			});
		  
		  //image focus
		  var toggleDetail = function(ele){
			  
			$(ele).children(".work_details").toggleClass("auto_height");
				$(ele).siblings('.item').children(".work_details").removeClass("auto_height");
				$container.isotope('reLayout');  
		  };
		  
		  if(ismobile){
			  $(".isotope-item").click(function(){
				toggleDetail(this);
				
			});
		  }
		  else{
			$(".isotope-item").hover(function(){
				toggleDetail(this);
				
			});
		  	}
		  

		
		$(".fancybox").fancybox({
			padding : 0,
			helpers : {
				overlay : {
					css : {
						'background' : 'rgba(0, 0, 0, 0.90)'
					}
				},
			beforeLoad : {
			}
			}
		});
	
	});
	function activenav(ele){
		var eleid = ele.attr('id');
		//console.log(eleid+'_btn');
		$('.main_nav li').removeClass('active');
		$('.'+eleid+'_btn').addClass('active');
	}
	function setstage(){
		bheight = $(window).height();
		$('.about, .works, .services, .team, .contact').css('min-height', bheight);
		if(!ismobile){
		 $('.sidebar').css('height', bheight);
		}
		
		
		widthcalc();
		
	}
	function widthcalc(){
		var wrapwidth = $container.width()
		
		if (wrapwidth / 4 >=250){
			worksisotope( wrapwidth / 4 );
		}else if (wrapwidth / 3 >=250){
			worksisotope( wrapwidth / 3 );
		}else if (wrapwidth / 2 >=250){
			worksisotope( wrapwidth / 2 );
		}else {
			worksisotope( wrapwidth );
		}
	}
	function worksisotope( iwidth ){
			//console.log(iwidth);
			$('.item').width(Math.floor(iwidth));
			$container.imagesLoaded(function() {
				$container.isotope({
					itemSelector : '.item',
					resizable: false,	
					masonry: { columnWidth: Math.floor(iwidth) },
				});
			});
		
	}
	
	function checkValidEmailAddress(emailAddress) {
    	var pattern = new RegExp(/^(("[\w-+\s]+")|([\w-+]+(?:\.[\w-+]+)*)|("[\w-+\s]+")([\w-+]+(?:\.[\w-+]+)*))(@((?:[\w-+]+\.)*\w[\w-+]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$)|(@\[?((25[0-5]\.|2[0-4][\d]\.|1[\d]{2}\.|[\d]{1,2}\.))((25[0-5]|2[0-4][\d]|1[\d]{2}|[\d]{1,2})\.){2}(25[0-5]|2[0-4][\d]|1[\d]{2}|[\d]{1,2})\]?$)/i);
    
		return pattern.test(emailAddress);
	};
	
	var mailsendstatus;
	
	function userSendMailStatus(uname, uemail, ucomments) {
		// checking for some valid user name
		
		if(!uname) {
			$("#name").next(".err").fadeIn('slow');
		}
		else if(uname.length > 3) {
			$("#name").next(".err").fadeOut('slow');		
		}
		
		// checking for valid email
		if(!checkValidEmailAddress(uemail)) {
			$("#email").next(".err").fadeIn('slow');
		}
		else if(checkValidEmailAddress(uemail)) {
			$("#email").next(".err").fadeOut('slow');	
		}
		if( ucomments == 'Your inquiry...' || ucomments == '' ) {
			$("#inquiry").next(".err").fadeIn('slow');
		}
		else if(ucomments.length > 5 && ucomments != 'Your inquiry...' )  {
			$("#inquiry").next(".err").fadeOut('slow');		
		}
		
		
		$("#subber .err").fadeOut('slow');
		
		//console.log(uname.length > 3 && uphone.length > 0 && ufood!=0 && checkValidEmailAddress(uemail));
		
		// ajax form post
		if(uname.length > 3 && checkValidEmailAddress(uemail) && ucomments.length > 5 && ucomments != 'Your inquiry...' ) {
			
				
					
					
				
			
			// in this case all of our inputs look good
			// so we say true and send the mail
			//console.log(2);
			mailsendstatus = true;
			$(".subber").html('<img src="images/ajax-loader.gif" width=51" height="40">');
		
			$.ajax(
				{
					type: 'POST',
					url: '/sendmail.php',
					data: $("#contactform").serialize(),
					success: function(data) {
						if(data == "yes") {
							$(".subber").html('<input type="submit" value="Send"><span class=""> Message received '+uname+', we&rsquo;ll get back to you soon.');
						
						}else {
							$(".subber").html('<input type="submit" value="Send"><span class=""> OOPS! error, please try again. </span>');
						}
					}
				}
			); // close sending email ajax call	
		}
			
		
		return mailsendstatus;
	}// JavaScript Document