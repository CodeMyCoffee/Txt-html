
/** 
*   Converts txt to html reading special tags in the txt
*
*   Gobal variables
*       DAY = day for the  get from dd/mm
*       MONTH = month for the notebookStructure dd/mm
*       CONTENT = store the content of notebookStructure or generalStructure, this must be formatted depending on the special tags
*       TITLE = title for the genral section, input must be {title}, later used for indexing of side bar
*       GENERAL_URL = store the target url
*       IS_LIST = list counter to keep track of nested lists
*       TAB_COUNT = helps determine when to close a list
*       IS_TABLE = int determines if line is part of a table & wich is the first line to make the table header
*       INDEX_ITEMS = string that contains every title in general section
*       GENERAL_CONTENT = all the content inside each section in the general estructure for each title
*       TO_REPLACE = special characters or words to be replaced
*       FOR_REPLACE = replacement for the words in array TO_REPLACE
*/

var day = 'DAY';
var month = 'MONTH';
var content = 'CONTENT';
var title = 'TITLE';
var general_url = 'NOTAREALURL';
var is_list = 0;
var is_table = 0;
var tab_count = 0;
var index_items = '';
var general_content = '';
var notebook_content = '';
var to_replace = [
    '\t\t', '\r', '\n','$ ', 'uL', 'alpha', 'omega','E.coli','Escherichia coli','Agrobacterium tumefaciens',
    'N. benthamiana','Nicotiana benthamiana','A. tumefaciens','Agrobacterium','Agro ','H2O','CH2','CH3','SUB','SB1','SUP','SP1','E.Z.N.A',"'",'^'
];
var for_replace =[
    '\t', '', '','$', '&mu;L', '&alpha;', '&Omega;','<i>E. coli</i>','<i>Escherichia coli</i>',
    '<i>Agrobacterium tumefaciens</i>','<i>N. benthamiana</i>','<i>Nicotiana benthamiana</i>','<i>A. tumefaciens</i>','<i>Agrobacterium</i>',
    '<i>Agrobacterium</i>','H<sub>2</sub>O','CH<sub>2</sub>','CH<sub>3</sub>','<sub>','</sub>','<sup>','</sup>',
    'E.Z.N.A &reg;','&rsquo;','&deg;'
];

/**
 * Reaload page
 */
function reload_page(){
    location.reload();
}


/**
 * Main function that converts the txt to html, this function call all the oders, and is triggered when "CONVERT" button is clicked
*/
function convert(){
    var input = $('#input').val().split('\n');
    if($('#radio_notebook').is(':checked')) { 
        //line iterator
        for(var i = 0;i < input.length;i++){
            if(input[i].search(/(^..\/.)\d+/g) != -1 && input[i].search("@") == -1){
                if(i>0){
                    notebook_content += '</p></div>';
                    getDay(input[i]);
                }else{
                    getDay(input[i]);
                }
            }else{
                var replaced_input = ''
                //here we get the general content between titles
                replaced_input = replaceImage(input[i]);                  //replace img source
                replaced_input = replace(replaced_input);                 //replace the special words in TO_REPLACE if they exist in the line
                replaced_input = replaceButton(replaced_input);           //replace buttons
                replaced_input = replaceLink(replaced_input);             //replace links
                input[i] = replaced_input;
                replaced_input = replaceList(replaced_input);             //determine if is a list & start it
                replaced_input = replaceTable(replaced_input);            //determine if it is a table & create it
                if(replaced_input == input[i]){
                    notebook_content += input[i]+'<br>';
                }else{
                    notebook_content += replaced_input;
                }
            }
        }
        //add closing tags to the last title after reading all the lines
        notebook_content += '</p></div>';
        document.getElementById("output").innerHTML = notebookStructure();    
    }else{
        //line iterator
        for(var i = 0;i < input.length;i++){
            //if there is a title in the line
            if(input[i].search("{") != -1){
                //if ! first title that appears, close previous section
                if(i >1){
                    general_content += '</p></div>';
                    getTitle(input[i]);
                }else{
                    getTitle(input[i])
                }
            }else{
                var replaced_input = ''
                if( i == 0){
                    general_url = input[i];
                }else{
                    //here we get the general content between titles
                    replaced_input = replaceImage(input[i]);                  //replace img source
                    replaced_input = replace(replaced_input);                 //replace the special words in TO_REPLACE if they exist in the line
                    replaced_input = replaceButton(replaced_input);           //replace buttons
                    replaced_input = replaceLink(replaced_input);             //replace links
                    input[i] = replaced_input;
                    replaced_input = replaceList(replaced_input);             //determine if is a list & start it
                    replaced_input = replaceTable(replaced_input);            //determine if it is a table & create it
                    if(replaced_input == input[i]){
                        general_content += input[i]+'<br>';
                    }else{
                        general_content += replaced_input;
                    }
                }
            }
        }
        //add closing tags to the last title after reading all the lines
        general_content += '</p></div>';
        document.getElementById("output").innerHTML = generalStructure();      
    }    
}

/**
 * Generates predefined structure for general pages, general_content must be generated BEFORE using this method
 */


function generalStructure() {
    return  '<section><div class="container-fluid"><div class="row"><div class="col-md-2 col-sm-3"><div class="side-nav margin-bottom-60 margin-top-30">'+
            '<div class="side-nav-head"><button class="fa fa-bars"></button><h4>Index</h4></div>'+
            '<ul class="list-group list-group-bordered list-group-noicon uppercase">'+
            index_items+'</ul></div></div>'+
            '<div class="col-md-10 col-sm-9">'+general_content+'</div></div></section>' 
}

/**
 * Generates predefined structure for notebook page, CONTENT and DAY and MONTH must be generated BEFORE using this method
 */
function notebookStructure(){
    return '<section><div class="container"><div class="timeline"><div class="timeline-hline"></div>'+notebook_content+'</div></div></section>'
}

/**
 * Simple functions to get the day, month and setting the opening tags for each section
 */
function getDay(line){
    var tmp = line.split('/');
    var months =['January','February','March','April','May','June','July','August','September','October','November','December'] 
    day = tmp[0];
    month = months[tmp[1]-1];
    notebook_content +='<div class="blog-post-item">'+
            '<div class="timeline-entry rounded">'+day+'<span>'+month.substring(0,3)+'</span><div class="timeline-vline"></div></div>'+
            '<br>'+'<p>';
}

/**
 * Gets the title of each section, and opens the container for the main content
 * also obtains the url for the addIndex function
 */
function getTitle(line){
    title = line.substring(line.search("{")+1,line.search("}"));
    var aux = title.split(" ").join('')+'_id'
    var temp = general_url;
    general_url = general_url+'#'+aux;
    general_content += '<div class="blog-post-item" id="'+aux+'"><h3>'+title+'</h3><p>' 
    addIndex(title);
    general_url = temp;
}

/** 
* Gets the title and adds it to the index
*/
function addIndex(line){
    index_items += '<li class="list-group-item"><a href="'+general_url+'"><span class="size-11 text-muted pull-right"></span>'+line+'</a></li>'
}

/**
 * Iterates over TO_REPLACE, in case any of the especial word appears in the line, it gets replaced with the correspondent FOR_REPLACE item
 */
function replace(line){
    for(var i = 0;i<to_replace.length;i++){
        if(line.search(to_replace[i]) != -1){ 
            line = line.split(to_replace[i]).join(for_replace[i]);
        }
    }
    return line;
}

/**
 * Replace any existing img width html tags and styling
 * if @ = regular full width img
 * if @l = img will be placed to the left
 * if @r = img will be placed to the right
 * 
 * A image footer can be placed between () after the image URL
 * 
 * It is mandatory to place a single img in a single line
 */
function replaceImage(line){
    if(line.search("@l") != -1){
        if(line.search(/(\()+/g) != -1){
            var img_footer = line.substring(line.search(/(\()+/g)+1,line.length-1);
            return '</p><div style="float:left;width:55%;margin:1em 1em 1em 0;"><img class="img-responsive" style="width:100%" src="'+line.substring(2,line.search(/(\()+/g)).trim()+'"><p class="imgFooterP" style="text-align: center;font-style: italic;">'+img_footer+'</p></div><p>'
        }else{
            return '</p><img class="img-responsive" style="float:left;width:55%;margin:1em 1em 1em 0;" src="'+line.substring(2)+'"><p>'
        }
    }
    else if(line.search("@r") != -1){
        if(line.search(/(\()+/g) != -1){
            var img_footer = line.substring(line.search(/(\()+/g)+1,line.length-1);
            return '</p><div style="float:right;width:55%;margin:1em 0em 1em 1em;"><img class="img-responsive" style="width:100%" src="'+line.substring(2,line.search(/(\()+/g)).trim()+'"><p class="imgFooterP" style="text-align: center;font-style: italic;">'+img_footer+'</p></div><p>'
        }else{
            return '</p><img class="img-responsive" style="float:right;width:55%;margin:1em 0em 1em 1em;" src="'+line.substring(2)+'"><p>'
        }
    }
    else if(line.search("@") != -1){
        if(line.search(/(\()+/g) != -1){
            var img_footer = line.substring(line.search(/(\()+/g)+1,line.length-1);
            return '</p><div style="text-align:center;"><img class="img-responsive" style="width:600px" src="'+line.substring(1,line.search(/(\()+/g)).trim()+'"><p class="imgFooterP" style="text-align: center;font-style: italic;">'+img_footer+'</p></div><p>'
        }else{
            return '</p><div style="text-align:center;"><img class="img-responsive" style="width:600px" src="'+line.substring(1)+'"></div><p>'
        }
    }
    else{
        return line;
    }
}

/**
 * Replace any existing list with html tags
 * if # = start of the list
 * List can be nested, each element is separated by a new line
 */
function replaceList(line){
    if (line.substring(0, 1) == "\#" || line.substring(0, 2) == "\/#" || is_list > 0 ) {
        if (line.search(/(\#)\w+/g) != -1 || line.search(/(\#\<)+/g) != -1) {
            is_list++;
            return '</p><ul><li>' + line.substring(is_list) + '</li>';
        }
        if (line.search(/(\/#)+/g) != -1) {
            is_list--;
            if (is_list == 0) {
                return '</ul><p>';
            } else {
                return '</ul>';
            }
        }
        if (is_list > 0) {
            return '<li>' + line + '</li>';
        } else {
            return line;
        }
    } else {
        return line;
    }
}

/**
 * Replace any existing table with html tags
 * if <t> = start of table
 * if </t> = end of table
 */
function replaceTable(line){
    if(line.search("<t>") != -1){
        is_table++;
        return '</p><div class="table-responsive" style="width:55%;overflow:inherit"><table class="table table-bordered table-striped">'
    }
    if(line.search("</t>") != -1){
        is_table -= 2;
        return '</table></div><p>'
    }
    if(is_table == 1){
        is_table++;
        var data = line.split("\t");
        var str = '<tr>'
        for(var i=0;i<data.length;i++){
            str += '<th>'+data[i]+'</th>';
        }
        return str+'</tr>'
    }
    if(is_table > 1){
        var data = line.split("\t");
        var str = '<tr>'
        for(var i=0;i<data.length;i++){
            str += '<td>'+data[i]+'</td>';
        }
        return str+'</tr>'
    }
    else{
        return line;
    }
}

/**
* Replace ¬ for buttons
* <a class="btn btn-reveal btn-teal" href="http://2016.igem.org/Team:Valencia_UPV/Safety" style="float:right;"><i class="fa fa-plus"></i><span>Safety</span></a>
*/
function replaceButton(line){
    if(line.search("¬") != -1){
        var path = line.substring(line.search("path")+5);
        return '<a class="btn btn-reveal btn-teal" href="'+path+'" style="float:right;"><i class="fa fa-plus"></i><span>'+line.substring(1,line.search("path")-1)+'</span></a>'
    }else{
        return line;
    }
}

/**
 * Generate link replacing [
 */
function replaceLink(line){
    if(line.search(/(\[)+/g) != -1){
        var path = line.substring(line.search("path")+5,line.search(/(\])+/g))
        return line.substring(0,line.search(/(\[)+/g))+
                '<a href="'+path+'">'+line.substring(line.search(/(\[)+/g)+1,line.search("path")-1)+'</a>'+
                line.substring(line.search(/(\])+/g)+1,line.length);
    }else{
        return line;
    }
}

/**
 * Create image carrousel
 */
function btn_carousel(){
    var input = $('#input').val().split('\n');
    console.log("CAROUSEL CHECK");
    var carouselOut = "<div class='sliderDiv'>";
    for(var i = 0;i < input.length;i++){
        carouselOut += imgCarousel(input[i]);
    }
    document.getElementById("output").innerHTML =   carouselOut+"</div>";
}


function imgCarousel(line){
    return "<img class='mySlides' src='"+line+"' >"
}