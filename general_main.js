
/** 
*   Converts txt to html reading special tags in the txt
*
*   Gobal variables
*       CONTENT = store the content of generalStructure, this must be formatted depending on the special tags
*       TITLE = title for the genral section, input must be {title}, later used for indexing of side bar
*       IS_LIST = list counter to keep track of nested lists
*       TAB_COUNT = helps determine when to close a list
*       IS_TABLE = int determines if line is part of a table & wich is the first line to make the table header
*       GENERAL_CONTENT = all the content inside each section in the general estructure for each title
*       TO_REPLACE = special characters or words to be replaced
*       FOR_REPLACE = replacement for the words in array TO_REPLACE
*/

var content = 'CONTENT';
var title = 'TITLE';
var is_list = 0;
var is_table = 0;
var tab_count = 0;
var general_content = '';
var to_replace = [
    '\t\t', '\r', '\n','$ ',  'uL', 'alpha', 'omega','E.coli','Escherichia coli','Agrobacterium tumefaciens',
    'N. benthamiana','Nicotiana benthamiana','A. tumefaciens','Agrobacterium','Agro ','H2O','CH2','CH3','SUB','SB1','SUP','SP1','E.Z.N.A',"'",'^'
];
var for_replace =[
    '\t', '', '','$',  '&mu;L', '&alpha;', '&Omega;','<i>E. coli</i>','<i>Escherichia coli</i>',
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
    //line iterator
        for(var i = 0;i < input.length;i++){
            //if there is a title in the line
            if(input[i].search("{") != -1){
                //if ! first title that appears, close previous section
                if(i >0){
                    general_content += '</p></div>';
                    getTitle(input[i]);
                }else{
                    getTitle(input[i]);
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
                    general_content += input[i]+'<br>';
                }else{
                    general_content += replaced_input;
                }
            }
        }
        //add closing tags to the last title after reading all the lines
        general_content += '</p></div>';
        document.getElementById("output").innerHTML = generalStructure();      
}

/**
 * Generates predefined structure for general pages, general_content must be generated BEFORE using this method
 */
function generalStructure() {
    return  '<section><div class="container-fluid"><div class="row">'+'<div class="col-md-12 col-sm-10">'+general_content+'</div></div></div></section>' 
}

/**
 * Gets the title of each section, and opens the container for the main content
 * also obtains the url for the addIndex function
 */
function getTitle(line){
    title = line.substring(line.search("{")+1,line.search("}"));    
    general_content += '<div><h3>'+title+'</h3><p>' 
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
            return '</p><div style="float:left;width:55%;margin:1em 1em 1em 0;"><img class="img-responsive" style="width:100%" src="'+line.substring(2,line.search(/(\()+/g)).trim()+'"><p style="text-align: center;font-style: italic;font-size: smaller;">'+img_footer+'</p></div>'
        }else{
            return '</p><img class="img-responsive" style="float:left;width:55%;margin:1em 1em 1em 0;" src="'+line.substring(2)+'"><p>'
        }
    }
    else if(line.search("@r") != -1){
        if(line.search(/(\()+/g) != -1){
            var img_footer = line.substring(line.search(/(\()+/g)+1,line.length-1);
            return '</p><div style="float:right;width:55%;margin:1em 0em 1em 1em;"><img class="img-responsive" style="width:100%" src="'+line.substring(2,line.search(/(\()+/g)).trim()+'"><p style="text-align: center;font-style: italic;font-size: smaller;">'+img_footer+'</p></div>'
        }else{
            return '</p><img class="img-responsive" style="float:right;width:55%;margin:1em 0em 1em 1em;" src="'+line.substring(2)+'"><p>'
        }
    }
    else if(line.search("@") != -1){
        if(line.search(/(\()+/g) != -1){
            var img_footer = line.substring(line.search(/(\()+/g)+1,line.length-1);
            return '</p><div style="text-align:center;"><img class="img-responsive" style="width:600px" src="'+line.substring(1,line.search(/(\()+/g)).trim()+'"><p style="text-align: center;font-style: italic;font-size: smaller;">'+img_footer+'</p></div>'
        }else{
            return '</p><img class="img-responsive" style="width:600px" src="'+line.substring(1)+'">'
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
        return '</p><div style="width:60%;overflow:inherit"><table class="table">'
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
*/
function replaceButton(line){
    if(line.search("¬") != -1){
        var path = line.substring(line.search("path")+5);
        return '<a class="btn btn-default" href="'+path+'">'+line.substring(1,line.search("path")-1)+'</a>'
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
