// Very fast access to jQuery properties
//http://james.padolsey.com/javascript/76-bytes-for-faster-jquery/
$_=function(a){return function(b){a[0]=b;return a}}(jQuery([1]));

(function($){
    
    $.fn.board = function(options){
        
        //Merge the passed in options with the board defaults, creating a new object
        var opts = $.extend({}, $.fn.board.defaults, options);
        
        var gameRowTemplate = $('<div class="row"><div class="token active token-1"></div><div class="token active token-2">'+
            '</div><div class="token active token-3"></div><div class="token active token-4"></div><div class="token active token-5">'+
            '</div><div class="token active token-6"></div><div class="score-me">Score me!</div></div>');
        
        //You could access the template directly, but who wants to keep making clones of elements    
        var gameRow = function(){
            return gameRowTemplate.clone();
        };
        
        return this.each(function(){
            var gameBoard,
                gameImage,
                keeper,
                scorer,
                newRow;
            
            gameImage = $("<img />",{
                "class": "progress",
                "src": "images/tree/tree10.png"
            }).appendTo(this);
            
			gameBoard = $('<div class="game-board"><div class="row">Stump Me!</div>' +
			             '</div>').appendTo(this);
            
            /*
             * Initialize helpers
             */
            
            //Initialize game card instance             
            keeper = gameKeeper( gameImage.get(0) );
            
            //Initialize instance of game scoring
            scorer = gameScorer( );
            
            /*
             * Initializes a new turn, calls the board and scorer as necessary
             */
            var newTurn = function(){
                
                var $tokens,
                    $this;
                
                if( this !== window ){
                    $this = $(this).hide();
                    
                    //Look into each token and find the current key
                    tokens = $.map($this.siblings('.token'),function(n,i){
                    
                        //Check if key is set(card clicked) otherwise return default 0
                        return $_(n).data('key') || 0;   
                    });
                    
                    //Check the input tokens against the correct answers
                    scorer.scoreBoard( tokens );
                }
                
                //Check for valid, miss, and invalid answers
                if( keeper.removeTurn() ){
                    
                    gameBoard.append( gameRow );
                }
            };
            
            /*
             * Bind event handlers
             */
            
            //Make 'Score' button do stuff
            $(this).delegate(".score-me","click",newTurn);
            
            //Make clicking token change the background image
			$(this).delegate('.active, .token', 'click', function(){
			
				var $this = $_(this), 
                    key = $this.data('key', $this.data('key') + 1).data('key');
				this.style.backgroundImage = 'url("images/enabled/' + opts.tokens[key % opts.tokens.length] + '.png")';
                
			});
            
            //Let the games play, call the first turn
            newTurn();
        });
    };
    
    $.fn.board.defaults = {
        correct: 'green',
        maybe: 'yellow',
        wrong: 'red',
        tokens: ['blue','red','green','black','white','yellow']
    };
    
    /*
     * Keeps track of game turns and the image (progress metric)
     */
    var gameKeeper = function(img){
        
        //Defines an image series that counts down as number of turns goes down
        // ie. image10.jpg, image9.jpg, image8.jpg
        var image = '',
            turns = 11, //Prime card with 11 as it will decrement on first firing
            regImageExt = /\d{1,2}(\.\w{3,4})/, //First image must end with 10 or the universe will implode
            domImage = img || null;
        
        if( domImage === null ){
            return; //No image available
        }
        
        return {
            
            removeTurn: function(){
                //Decrement max number of turns left, if any left
                if( turns > 0 ){
                    
                    turns--;
                }
                if( domImage ){
                    domImage.src = domImage.src.replace( regImageExt, turns + "$1" );
                }
                return turns;
            },
            
            clearTurns: function(){
                //Reset game go back to 10 turns left
                turns = 10;
            },
            
            getTurns: function(){
                
                return turns;
            }
            
        };
    };
    
    /*
     * Nomenclature: 
     *   token: possible answer in the range of possible colors (represented as number)
     */    
    var gameScorer = function(){
        
        var answers = [];
        
        //Create answer set, stored privately
        for( var i = 0; i < 6; ++i){
            
            answers.push( Math.round( Math.random() * 6 ) );
        } 
        
        return {
            
            //Array of attempted answers, compare this to correct set
            scoreBoard: function( tokens /*array*/ ){
                
                var ans = answers.slice(0), //JS method for making a deep copy of an array
                    correct = 0,
                    missed = 0,
                    pos,i,n,token;
                
                //Check the answers given
                for( var i = 0, n = tokens.length; i < n, token = tokens[i] ;++i){
                    //Found token in answer set, compare against original answer array to see if position is correct
                    if( (pos = ans.indexOf( token )) > -1 ){
                        
                        ans.slice(pos,1); //remove found element from array
                        if( answers[i] === tokens[i] ) {
                            correct++;  
                        } else {
                            missed++;
                        }
                    }
                }
                //Return struct of correct and missed answers
                return {
                    correct: correct,
                    missed: missed
                };
                
            },
            
            score: function(answers, token){
                
                
            }    
            
        };
    };    
    
}) (jQuery);
