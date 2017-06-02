/**
 *  
 * DAW Main Namespace
 * 
 */
var DAW = DAW || {};

/**
 * 
 * DAW.Products Class
 *
 * @author Aldo Coria <aldocoria(at)gmail.com>
 *
 */

DAW.Products = {
	/**
	 *
	 * DAW.Products.setup
	 * 
	 * @description you can change the values from DAW.Products.setup object properties
	 * 
	 */
	setup : {
		'skip'				: 0, // DAW.Products.setup.skip default value
		'limit'				: 20, // DAW.Products.setup.limit default value
		'previousSponsor'	: null, // DAW.Products.setup.previousSponsor default value
		'gap'				: 10, // DAW.Products.setup.gap value for fix zoom issue when deteccting scroll position
		$productsGrid   	: $('#products_grid_body')
	},
	/**
	 * DAW.Products.init Method
	 */
	init : function () {
		this.bindActions();
		this.loadProducts(); // load products for first time and next batch
	},
	/**
	 * DAW.Products.bindActions Method
	 */
	bindActions : function () {
		this.bindScrollBar();
		this.bindSortBy();
	},
	/**
	 * DAW.Products.bindSortBy Method
	 */		
	bindSortBy : function () {
		var that = this,
			$sortBy = $('.sortable');
		
		$sortBy.on('click', function (e) {
			e.preventDefault();
			that.sortProducts($(this));
		});
	},
	/**
	 * DAW.Products.bindScrollBar Method
	 */
	bindScrollBar : function () {
		var that = this;
		
		$(window).on('scroll', function () {
         	if (!$.active) { 
             	that.checkScrollAndLoadMore(); 
         	}
        });
	},
	/**
	 * DAW.Products.checkScrollAndLoadMore Method
	 */
  	checkScrollAndLoadMore : function () {
        var currentScroll = $(window).scrollTop(),
        	$hiddenRow = $('.hide-row');

        if (currentScroll + $(window).height() >= $(document).height() - this.setup.gap) {
            $hiddenRow.removeClass('hide-row').addClass('show-row');
            this.addHiddenProductsToGrid();
        }
    },
    /**
     * DAW.Products.loadProducts Method
     */
	loadProducts : function () {
		var that = this;
		// Get first batch of products and next in background
		this.getProductsBatch(function(data) {
			that.addProductsToGrid(data, true); // add products to the grid
			that.addHiddenProductsToGrid(); // add next batch of products to the grid with a "hide-row" css class
		});
	},
	/**
	 * DAW.Products.sortProducts
	 */
	sortProducts : function (domEl) {
		this.setup.skip = 0; // set DAW.setup.skip to 0 again
		this.setup.sortBy = $(domEl).attr('id') // sort by id of column header
		this.setup.$productsGrid.empty(); // empty products container
		this.loadProducts();
	},
	/**
	 * DAW.Products.getProductsBatch Method
	 */
	getProductsBatch : function (callback) {
		var that = this,
			url = '/api/products',
			$loading = $('.loading');

		$.ajax({
			dataType : "json",
			url : url,
			data : {
				limit : that.setup.limit,
				skip  : that.setup.skip,
				sort  : (that.setup.sortBy) ? that.setup.sortBy : '' 
			},
			beforeSend : function () {
				$loading.show();
			},                 
			success: function(data) {
				if (data) {
					$loading.hide();
					callback(data);	
				}
			},
			error: function (request, status, error) {
				$loading.hide();
				console.log('error: "' + error + '"\nstatus: "' + status + '"\nresponseText: ' + request.responseText);
			}
        }).done(function () {
        	that.checkScrollAndLoadMore();
        });
	},
	/**
	 * DAW.Products.addProductsToGrid Method
	 * 
	 * @param {object} data [data results from Ajax request]
	 * @param {boolean} show [if show or not the results depending if were fetched in background or not]
	 */
	addProductsToGrid : function (data, show) {
		var prod,
			html,
			display = (show) ? 'show-row' : 'hide-row';

		for (prod in data) {
			html += "<tr class='" + display + "'><td>" + data[prod].id + "</td><td>" + data[prod].size + "px</td><td>" + DAW.Helpers.toMoney(data[prod].price) + "</td><td><span style='font-size:" + data[prod].size + "px'>" + data[prod].face + "</span></td><td>" + DAW.Helpers.toDays(data[prod].date) + "</td>";
		}
		DAW.Products.setup.$productsGrid.append(html); // append products rows
		DAW.Products.setup.$productsGrid.append(DAW.Products.getSponsorRow(show)); // append sponsor row
	},
	/**
	 * DAW.Products.addHiddenProductsToGrid Method
	 */
	addHiddenProductsToGrid : function () {
		var that = this;
		this.setup.skip = this.setup.skip + this.setup.limit; // increment skip to fetch next batch in bg
		this.getProductsBatch(function(data) {
			that.addProductsToGrid(data, false);
		});
	},
	/**
	 * DAW.Products.getSponsorRow Method
	 * 
	 * @param {boolean} show or not will add corresponding css class 
	 * @return {string} returns a random sponsor row string 
	 * 
	 */
	getSponsorRow : function (show) {
		var display = (show) ? 'show-row' : 'hide-row',
			randomNumber = Math.floor(Math.random()*1000);
        
        while (randomNumber === this.setup.previousSponsor) { 
   			randomNumber = Math.floor(Math.random()*1000);
        }
       	this.setup.previousSponsor = randomNumber;
		return  "<tr class='" + display +" sponsor-row'><td colspan='5'><h5>Sponsor: </h5>" + "<img class='ad' src='/ad/?r=" + randomNumber + "'/></td></tr>";
	}
};
/**
 * 
 */

/**
 * 
 * DAW.Helpers Object
 * 
 * @description Here I've placed all the helpers functions/methods
 * 
 */
DAW.Helpers = {
	/**
	 * DAW.Helpers.toMoney Method
	 * 
	 * @return returns price formatted as dollars like `$3.51`.
	 * 
	 */
	toMoney : function (price) {
	    var cents = parseFloat(price) ? price : 0.0,
	    	components = (cents / 100).toFixed(2).toString().split("."),
	     	decimal    = components[1],
	     	dollars    = components[0] || "",
	     	numberOfDigits = 3,
	     	mod, remainder, money;
	    
	    var stringReverse = function (str) {
	        return str.split("").reverse().join("");
	    };

	    if (dollars.length > numberOfDigits) {
	        dollars = stringReverse(dollars);
			remainder = (mod = dollars.length % numberOfDigits) ? stringReverse(dollars.slice(mod * -1)) + "," : "";
			dollars = remainder + stringReverse(dollars.match(/.../g).join(","));
	    }

	    money = ["$", [dollars, decimal].join(".")].join("");
	    return money;
			
	},
	/**
	 * DAW.Helpers.toDays
	 *
	 * @description returns dates in relative time (eg. "3 days ago") 
	 * unless they are older than 1 week, in which case the full date should be displayed
	 * 
	 * @param {date} date when product was added to the db
	 * @return {string} difference between today and param date
	 */
	toDays : function (date) {
		var today = new Date(),
			date = new Date(date),
			aWeek = 7,
			oneDay = 24*60*60*1000,
			diff = Math.round( Math.abs( (today.getTime() - date.getTime()) / (oneDay)));

		return (diff <= aWeek ) ? diff + ' days ago' : date;
	}

};

$(function () {
	$(window).scrollTop(0);
	DAW.Products.init();
});
