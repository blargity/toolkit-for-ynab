(function poll() {
  if ( typeof ynabToolKit !== "undefined" && ynabToolKit.pageReady === true ) {
  
    // When this is true, the feature scripts will know they can use the mutationObserver
    ynabToolKit.actOnChangeInit = {};

    // Set 'ynabToolKit.debugNodes = true' to print changes the mutationObserver sees
    // during page interactions and updates to the developer tools console.
    ynabToolKit.debugNodes = false;

    ynabToolKit.actOnChange = function() {
  
      MutationObserver = window.MutationObserver || window.WebKitMutationObserver;
  
      var observer = new MutationObserver(function(mutations, observer) {
        
        if (ynabToolKit.debugNodes) {
          console.log('MODIFIED NODES');
        }
        
        // Reset the digest of changed nodes on each unique mutation event
        ynabToolKit.digest = new Array();
        
        mutations.forEach(function(mutation) {
          var newNodes = mutation.target;
          if (ynabToolKit.debugNodes) {
            console.log(newNodes);
          }
  
          var $nodes = $(newNodes); // jQuery set
          $nodes.each(function() {
            var $node = $(this);
  
            
            ynabToolKit.digest.push($node);             
              
  
          }); // each node mutation event
  
        }); // each mutation event
        
        if (ynabToolKit.debugNodes) {
          console.log('###')
        }
        
        // Loop through the array and act if we find a relevant changed node in the digest
        for ( var i = 0; i < ynabToolKit.digest.length; i++ ) { 

        	// Changes are detected in the category balances
        	if ($(ynabToolKit.digest[i]).hasClass("budget-table-cell-available-div")) {
        	  
        	  if ( ynabToolKitOptions.updateInspectorColours ) {  
        	      ynabToolKit.updateInspectorColours();
        	  }

        	  break;
        	  
        	} 
        }

        for ( var i = 0; i < ynabToolKit.digest.length; i++ ) { 

        	// The user has switched screens
        	if ($(ynabToolKit.digest[i]).hasClass('layout')) {
        		if ( ynabToolKit.featureOptions.resizeInspector ){
        		  ynabToolKit.resizeInspector();
        		}
        		break;
        	}
        	  
        }

        for ( var i = 0; i < ynabToolKit.digest.length; i++ ) { 

        	// The user has returned back to the budget screen
        	if ($(ynabToolKit.digest[i]).hasClass('budget-inspector')) {
        	  
        		if ( ynabToolKitOptions.checkCreditBalances ){
        		  ynabToolKit.checkCreditBalances();
        		}
        		if ( ynabToolKitOptions.highlightNegativesNegative ){
        		  ynabToolKit.highlightNegativesNegative();
        		}
        		if ( ynabToolKitOptions.insertPacingColumns ){
        		  ynabToolKit.insertPacingColumns();
        		}
            if ( ynabToolKitOptions.budgetProgressBars ){
              ynabToolKit.budgetProgressBars();
            }

        		break;
        	}
        	  
        }

        for ( var i = 0; i < ynabToolKit.digest.length; i++ ) { 

        	// We found a modal pop-up
        	if ($(ynabToolKit.digest[i]).hasClass( "options-shown")) {
        	  
				if ( ynabToolKitOptions.removeZeroCategories ) {        
				  ynabToolKit.removeZeroCategories();
				}
				if ( ynabToolKitOptions.moveMoneyAutoComplete ) {       
				  ynabToolKit.moveMoneyAutoComplete();
				}

				break;
        	  
        	}
        }

        for ( var i = 0; i < ynabToolKit.digest.length; i++ ) { 

        	// User has selected a specific sub-category
        	if ( $(ynabToolKit.digest[i]).hasClass('is-sub-category') && $(ynabToolKit.digest[i]).hasClass('is-checked')) {

				if ( ynabToolKitOptions.updateInspectorColours ) {  
				  ynabToolKit.updateInspectorColours();
				}

				break;

        	}
        }
      
      });
  
      // This finally says 'Watch for changes' and only needs to be called the one time
      observer.observe($('.ember-view.layout')[0], {
        subtree : true,
        childList : true,
        characterData : true,
        attributeFilter : [ 'class' ]
      });
      
      ynabToolKit.actOnChangeInit = true;
    };
    ynabToolKit.actOnChange(); // Run itself once

  } else {
    setTimeout(poll, 250);
  }   
})();
