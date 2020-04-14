(function($)
{
    /**
     * Auto-growing textareas; technique ripped from Facebook
     *
     * https://github.com/jaz303/jquery-grab-bag/tree/master/javascripts/jquery.autogrow-textarea.js
     */
    $.fn.autogrow = function(options)
    {
        return this.filter('textarea').each(function()
        {
            var self         = this;
            var $self        = $(self);
            var minHeight    = $self.height();
            var noFlickerPad = $self.hasClass('autogrow-short') ? 0 : parseInt($self.css('lineHeight')) || 0;
            var shadow = $('<div class="note"></div>').css({
                position:    'absolute',
                top:         -10000,
                left:        -10000,
                //width:       $self.width(),
                fontSize:    $self.css('fontSize'),
                fontFamily:  $self.css('fontFamily'),
                fontWeight:  $self.css('fontWeight'),
                lineHeight:  $self.css('lineHeight'),
                resize:      'none',
                'word-wrap': 'break-word'
            }).appendTo(document.body);

            var update = function(event)
            {
                var times = function(string, number)
                {
                    for (var i=0, r=''; i<number; i++) r += string;
                    return r;
                };

                var val = self.value.replace(/</g, '&lt;')
                                    .replace(/>/g, '&gt;')
                                    .replace(/&/g, '&amp;')
                                    .replace(/\n$/, '<br/>&nbsp;')
                                    .replace(/\n/g, '<br/>')
                                    .replace(/ {2,}/g, function(space){ return times('&nbsp;', space.length - 1) + ' ' });
                
                // Did enter get pressed?  Resize in this keydown event so that the flicker doesn't occur.
                if (event && event.data && event.data.event === 'keydown' && event.keyCode === 13) {
                    val += '<br />';
                }
                //shadow.css('width', $self.width());
                shadow.html(val + (noFlickerPad === 0 ? '...' : '')); // Append '...' to resize pre-emptively.
                $self.height(Math.max(shadow.height() + noFlickerPad, minHeight));
            }

            $self.change(update).keyup(update).keydown({event:'keydown'},update);
            $(window).resize(update);
            update();
        });
    };
})(jQuery);
/*Set Global variable assignment at start of application*/
var i=0, offsetX=0, offsetY=0,circle, startX = 0, startY = 0, prevHeight = 0, prevWidth = 0, drawDirection = '', mousedown = false, last_mousex = 0, last_mousey = 0, connection = "", scrollx = 0, scrolly = 0, clr = "", canvas = "", ctx = "", wth = 1, type = "", drawType = "", colId = "", gridView = true, update = false, isDown = false, noteId = 10000, colNo = 10000, boardId = 90000, workArea = [""], workSpace = [""], colZindex = 1, noteZindex = 1000, colUAZindex = 90000, prevX = 0, prevY = 0, prevNote = "", prevCol, dropTarget = "", dropDir = "", dropVer = "", data = "", dbFunction = "", pageHeight = 0, pageWidth = 0, desc = "", blurId = "", focusId = "", postitId = "", postColId, dragFrom = "", marginTop = 0, marginLeft = 0, topCtr = 0, leftCtr = 0;
/*Create new column and menu on board*/
function addCol(boardId, colNo, columnId, pageHeight, desc, order) {
    $('#bord').before('<div class="col" id = "bord' + boardId + '" ondragstart = "drag(event)" ondragover = "allowDrop(event)" ondrop = "drop(event)" style="z-index:' + colZindex++ +'">'
       + '<div id="menu' + boardId + '" draggable="false" ondragstart="event.stopPropagation()" class="col_menu">'
       + '<input type="text" id = "link' + boardId + '" draggable="false" value="' + columnId + '" style="display: none;">'
       + '<input type="text" id = "order' + boardId + '" value="' + order + '" style="display: none;"/>'
       + '<a type="button" draggable="false" ondragover="event.stopPropagation()" id = "add_new' + boardId + '"><i class="fas fa-sticky-note menuicon" style="padding:3px 5px 3px 5px;"></i></a>'
       + '<a type="button" draggable="false" ondragover="event.stopPropagation()" style="float:right;" id = "delete_col' + boardId + '"><i class="fas fa-times menuicon" style="padding:3px 5px 3px 5px;"></i></a>'
       + '<a type="button" draggable="false" ondragover="event.stopPropagation()" style="float:right;" id = "maxCol' + boardId + '"><i class="fas fa-window-restore menuicon" style="padding:3px 5px 3px 5px;"></i></a>'
       + '<a type="button" draggable="false" ondragover="event.stopPropagation()" style="float:right;" id = "minCol' + boardId + '"><i class="fas fa-window-minimize menuicon" style="padding:0px 5px 0px 5px;"></i></a>'
       + '<a type="button" draggable="false" ondragover="event.stopPropagation()" style="float:right;" id = "lock_col_pos' + boardId + '"><i class="fas fa-thumbtack menuicon fa-rotate-90" style="padding:3px 5px 3px 5px;"></i></a>'
       + '<a type="button" draggable="false" ondragover="event.stopPropagation()" style="float:right;" id = "add_new' + boardId + '"><i class="fas fa-print menuicon" style="padding:3px 5px 3px 5px;"></i></a></div>'
       + '<div id="iput' + boardId + '" class="col-board"><input ondrop="event.stopPropagation()" class="col_header" id="head' + boardId + '" value="' + desc + '" placeholder="enter column name" ondragover="return false"/></div >'
       + '<div class="col-scroll scrollbar bord-scroll bord-track bord-thumb" draggable="false" id = "bord' + colNo + '"style="z-index:'+ noteZindex++ +'"></div>'
        + '</div> ');
    console.log('this is the col number ' + colNo);
    /*Set column dragable*/
    if (gridView == true) {
        $('#bord' + boardId).attr('draggable', 'true');
    }
    else {
        $('#bord' + boardId).attr('draggable', 'false');
        /*Set the draggable handle and boarders of the Work Area*/
        $(function () {
            $("#bord" + boardId).draggable({
                handle: $('#menu' + boardId), stop: function dragEnd(ev) {
                    data = ev.target.id;
                    //console.log('data ' + data);
                    $('.col').css('border', '1px none grey');
                }
            });
            /*move the work area to the top as the item is dragged over the other work areas by increasing the z-index*/
            $("#bord" + boardId).droppable({
                over: function (event, ui) {
                    $("#" + dragFrom).css("z-index", colUAZindex++);
                }
            });
        });
    }
    /*set column height of board to equal screen height*/
    $("#bord" + boardId).height(pageHeight-130);
    $("#bord" + colNo).height(pageHeight - 210);

     /*Set actions for column menu*/

    /*Create new Note on click*/
    $('a[id ^= "add_new' + boardId + '"]').on('click', function (event) {
        var url = 'https://localhost:44382/api/notes/';
        addNote(url, $('#link' + boardId).val(), '#bord' + colNo, noteId++);
        var scr = $('#bord' + colNo)[0].scrollHeight;
        $('#bord' + colNo).animate({ scrollTop: scr }, 200);
    });

    $('a[id ^= "minCol' + boardId + '"]').on('click', function (event) {
        var column = $(this).parent().parent().attr('id');
        var scroll = $('#bord' + colNo).attr('id');
        $('#' + scroll).css({ "height": "0px" });
        $('#' + column).css({ "height": "70px" });
        $('#' + column).css({ "width": "170px" });
    });

    $('a[id ^= "maxCol' + boardId + '"]').on('click', function (event) {
        var column = $(this).parent().parent().attr('id');
        var scroll = $('#bord' + colNo).attr('id');
        $('#' + scroll).css({ "height": pageHeight - 210 });
        $('#' + column).css({ "height": pageHeight - 130 });
        $('#' + column).css({ "width": "250px" });
    });

    /*Lock Column and toggle pin to locked - unlocked*/
    $('a[id ^= "lock_col_pos' + boardId + '"]').on('click', function (event) {
        var menuId = $(this).attr('id');
        var columnId = $(this).parent().parent().attr('id');
        var element = document.getElementById(menuId);
        element.classList.toggle("fa-rotate-270");
        //element.classList.toggle("menuicon-pinned");
        lockColumn(columnId);
    });
    /*Delete selected column. note column needs to be unlocked and all notes need to be removed from the column before delete*/
    $('a[id ^= "delete_col' + boardId + '"]').on('click', function (event) {
        var column = $(this).parent().parent().attr('id');
        deleteColumn(column,columnId);
    });
    /*Update Board Header details*/
    $('#head' + boardId).on('input', function (e) {
         colDesc = JSON.stringify($('#head' + boardId).val());
        var updateString = '[{"op": "add","path": "/column_Description","value": ' + colDesc + ' }]';
        patchCol('https://localhost:44382/api/column/', columnId, updateString);
        $('#hide_Col' + boardId).text($('#head' + boardId).val()); 
    });
    /*Set Column draggable condition based on focus state*/
    $('#head' + boardId).on('focus', function (e) {
        //console.log('focus set to false');
        $('#bord' + boardId).attr('draggable', 'false');
    });
    /*Set Column draggable condition based on focus state*/
    $('#head' + boardId).on('blur', function (e) {
        //console.log('focus set to true');
        $('#bord' + boardId).attr('draggable', 'true');
    });
} 

function addUACol(boardId, colNo, columnId, pageHeight, desc, order, setTop, setRight) {
    //console.log('page No & Height ' + colNo, pageHeight);
    $('#bord').before('<div class="colUA draggable" id = "bord' + boardId + '" ondragstart="drag(event)" ondragover="allowDrop(event)" ondrop="drop(event)" style="position: -webkit-sticky;position: sticky; position: fixed; top: '+setTop+'px; right: '+setRight+'px;float: right;z-index: ' + colUAZindex++ +'">'
        + '<div id="menu' + boardId + '" draggable="false" ondragstart="event.stopPropagation()" class="col_menu">'
        + '<input type="text" id = "link' + boardId + '" draggable="false" value="' + columnId + '" style="display: none;">'
        + '<input type="text" id = "order' + boardId + '" value="' + order + '" style="display: none;"/>'
        + '<a type="button" draggable="false" ondragover="event.stopPropagation()" id = "add_new' + boardId + '"><i class="fas fa-sticky-note menuicon" style="padding:3px 5px 3px 5px;"></i></a>'
        + '<a type="button" draggable="false" ondragover="event.stopPropagation()" style="float:right;" id = "delete_col' + boardId + '"><i class="fas fa-times menuicon" style="padding:3px 5px 3px 5px;"></i></a>'
        + '<a type="button" draggable="false" ondragover="event.stopPropagation()" style="float:right;" id = "maxUACol' + boardId + '"><i class="fas fa-window-restore menuicon" style="padding:3px 5px 3px 5px;"></i></a>'
        + '<a type="button" draggable="false" ondragover="event.stopPropagation()" style="float:right;" id = "minUACol' + boardId + '"><i class="fas fa-window-minimize menuicon" style="padding:0px 5px 0px 5px;"></i></a>'
        + '<a type="button" draggable="false" ondragover="event.stopPropagation()" style="float:right;" id = "lock_col_pos' + boardId + '"><i class="fas fa-thumbtack menuicon fa-rotate-90" style="padding:3px 5px 3px 5px;"></i></a>'
        + '<a type="button" draggable="false" ondragover="event.stopPropagation()" style="float:right;" id = "add_new' + boardId + '"><i class="fas fa-print menuicon" style="padding:3px 5px 3px 5px;"></i></a></div>'
        + '<div id="iput' + boardId + '"><input ondrop="event.stopPropagation()" class="col_header" id="head' + boardId + '" value="' + desc + '" placeholder="enter column name" ondragover="return false"/></div >'
        + '<div class="col-scroll scrollbar bord-scroll bord-track bord-thumb" id = "bord' + colNo + '"style="position: relative; z-index:' + noteZindex++ + '"></div>'
        + '</div> ');
    console.log('UA col number ' + colNo);
    /*Set column dragable*/
    $('#bord' + boardId).attr('draggable', 'true');
    /*Set the draggable handle and boarders of the Work Area*/
    $(function () {
        $("#bord" + boardId).draggable({
            handle: $('#menu' + boardId), stop: function dragEnd(ev) {
                data = ev.target.id;
                $('.colUA').css('border', '1px solid grey');
            }
        });
        /*move the work area to the top as the item is dragged over the other work areas by increasing the z-index*/
        $("#bord" + boardId).droppable({
            over: function (event, ui) {
                $("#" + dragFrom).css("z-index", colUAZindex++);
             }
        });
    });
       
/*Set work area Id on creation of work area board*/
    workArea[order] = 'bord' + boardId;
    workSpace[order] = 'bord' + colNo;
    /*set column height of board to equal screen height*/
    $("#bord" + boardId).height(pageHeight - 130);
    $("#bord" + colNo).height(pageHeight - 210);
        
    /*Set actions for column menu*/
        
    /*Create new Note on click*/
    $('a[id ^= "add_new' + boardId + '"]').on('click', function (event) {
        var url = 'https://localhost:44382/api/notes/';
        addUANote(url, $('#link' + boardId).val(), '#bord' + colNo, noteId++);
        var scr = $('#bord' + colNo)[0].scrollHeight;
        $('#bord' + colNo).animate({ scrollTop: scr }, 200);
    });

    $('a[id ^= "minUACol' + boardId + '"]').on('click', function (event) {
        var column = $(this).parent().parent().attr('id');
        var scroll = $('#bord' + colNo).attr('id');
        $('#' + scroll).css({ "height": "0px" });
        $('#' + column).css({ "height": "70px" });
    });

    $('a[id ^= "maxUACol' + boardId + '"]').on('click', function (event) {
        var column = $(this).parent().parent().attr('id');
        var scroll = $('#bord' + colNo).attr('id');
        $('#' + scroll).css({ "height": pageHeight - 210 });
        $('#' + column).css({ "height": pageHeight - 130 });
    });

    /*Lock Column and toggle pin to locked - unlocked*/
    $('a[id ^= "lock_col_pos' + boardId + '"]').on('click', function (event) {
        var menuId = $(this).attr('id');
        var columnId = $(this).parent().parent().attr('id');
        var element = document.getElementById(menuId);
        element.classList.toggle("fa-rotate-270");
        lockColumn(columnId);
    });
    /*Delete selected column. note column needs to be unlocked and all notes need to be removed from the column before delete*/
    $('a[id ^= "delete_col' + boardId + '"]').on('click', function (event) {
        var column = $(this).parent().parent().attr('id');
        deleteColumn(column, columnId);
    });
    /*Update Board Header details*/
    $('#head' + boardId).on('input', function (e) {
        colDesc = JSON.stringify($('#head' + boardId).val());
        var updateString = '[{"op": "add","path": "/column_Description","value": ' + colDesc + ' }]';
        patchCol('https://localhost:44382/api/column/', columnId, updateString);
        $('#hide_Col' + boardId).text($('#head' + boardId).val()); 
    });
    /*Set Column draggable condition based on focus state*/
    $('#head' + boardId).on('focus', function (e) {
        $('#bord' + boardId).attr('draggable', 'false');
    });
    /*Set Column draggable condition based on focus state*/
    $('#head' + boardId).on('blur', function (e) {
        $('#bord' + boardId).attr('draggable', 'true');
    });
} 
function newNote(colNo, colId, noteId, id, desc, order, close, lock, left, top) {
    //console.log(colNo + ' - ' + colId + ' - ' + noteId + ' - ' + id + ' - ' + desc + ' - ' + order + ' - ' + close + ' - ' + lock +' - ' + left + ' - ' +top)
    var noteTemp = '<div class="note" ondragstart="drag(event)" ondragover="allowDrop(event)">'
        + '<a type="button" id="close_Note' + noteId + '" class="button_note end"><i class="fas"></i></a><a type="button" id="lock_Note' + noteId + '" class="button_note lock"><i class="fas fa-thumbtack  "></i></a><a type="button" id = "delete_Note' + noteId + '" class="button_note remove"><i class="fas fa-times"></i></a>'
        + '<input type="text" id = "link' + noteId + '" value="' + id + '" style="display: none;"/>'
        + '<input type="text" id = "order' + noteId + '" value="' + order + '" style="display: none;"/>'
        + '<input type="text" id = "close' + noteId + '" value=' + close + ' style="display: none;"/>'
        + '<input type="text" id = "lock' + noteId + '" value=' + lock + ' style="display: none;"/>'
        + '<div class="note_cnt" id="note' + noteId + '_cnt" style="padding-top:10px" draggable="false">'      
        + '<div id="note' + noteId + '_Text2" draggable="false"><textarea id="text' + noteId +'" class="cnt note-text" draggable="false" placeholder="Enter details here">'+desc+'</textarea></div>'
        + '</div> '
        + '</div>';

    $(noteTemp).attr('id', 'note' + noteId).hide().appendTo(colId).show("fade", 300,
        function () {
            $(this).zIndex(++noteZindex);
        });
    //Find diff between not offset and pointer position on not so as to position note based on offset not pointer when dragged and dropped
    $('#note' + noteId).mousedown(function (e) {
        offsetX = (parseInt(e.pageX) - parseInt($('#note' + noteId).offset().left)) / 1.6;
        offsetY = (parseInt(e.pageY) - parseInt($('#note' + noteId).offset().top)) / 1.6;
    });
    //Set icon class if note is archived / locked
    $('i', '#close_Note' + noteId).addClass(($('#close' + noteId).prop('value') == "false") ? "fa-file-import" : "fa-file-export");
    $('i', '#lock_Note' + noteId).addClass(($('#lock' + noteId).prop('value') == "false") ? "fa-rotate-90" : "");
    var locked = $('#lock' + noteId).prop('value');
    if ($('#lock' + noteId).prop('value') == 'true') {
        $("#text" + noteId).prop("readonly", 'true');
        $('#delete_Note' + noteId).toggleClass('disable-menu-items');
    }
    //Set note to draggable
    $('#note' + noteId).attr('draggable', 'true');
  
    $('#text' + noteId).on('dragstart', function (e) {
        $('#text' + noteId).css('border', 'solid 1px green'); 
        e.preventDefault();
    });

    /*Lock Note and toggle pin to locked - unlocked*/
    $('a[id ^= "lock_Note' + noteId + '"]').on('click', function (event) {
        $('#lock' + noteId).val(($('#lock' + noteId).prop('value') == "false") ? "true" : "false");
        $("i", this).toggleClass("fa-rotate-90 fa-rotate-0");
        lockNote(noteId);
    });

    /*Close Note and toggle icon to close - open*/
    $('a[id ^= "close_Note' + noteId + '"]').on('click', function (event) {
        $('#close' + noteId).val(($('#close' + noteId).prop('value') == "false") ? "true" : "false");
        $("i", this).toggleClass("fa-file-import fa-file-export");
        closeNote(noteId);
    });

    $('a[id ^= "delete_Note' + noteId + '"]').on('click', function (event) {
        var noteId = $(this).parent().attr('id');
        var columnId = $(this).parent().parent().parent().attr('id');
        deleteNote(noteId,columnId);
    });
  
    $('#text' + noteId).on('input', function (e) {
        url = 'https://localhost:44382/api/notes/';
        var noteDesc = JSON.stringify($('#text' + noteId).val()); 
        id = $('#link' + noteId).val(); 
        var updateString = '[{"op": "add","path": "/postit_Desc","value": ' + noteDesc + '}]';
        patchNote('https://localhost:44382/api/notes/', updateString, colId, colNo, noteId, id, desc);
    });

    //Set textarea to autogrow
    $('#text' + noteId).autogrow();

    /*Set note draggable condition based on focus state*/
    $('#text' + noteId).on('focus', function (e) {
        if ($(this).is('[readonly]')) {
            alert('Note is locked - unlock note before editing');
            $(this).blur();
        }
        else {
            $('#note' + noteId).attr('draggable', 'false');
            focusId = $(this).parent().parent().parent().parent().parent().attr('id');
            if (blurId != focusId && blurId != "") {
                $('#' + blurId).attr('draggable', 'true');
            }
            $('#' + $(this).parent().parent().parent().parent().parent().attr('id')).attr('draggable', 'false');
        }

    });
    /*Set note draggable condition based on focus state*/
    $('#text' + noteId).on('blur', function (e) {
        $('#note' + noteId).attr('draggable', 'true');
        $('#' + $(this).parent().parent().parent().parent().parent().attr('id')).attr('draggable', 'true');
        blurId = $(this).parent().parent().parent().parent().parent().attr('id');
        $(this).css('border', 'none 1px red'); 
    });

    var textAreaArray = document.querySelectorAll("textarea");
    for (var i = textAreaArray.length - 1; i >= 0; i--) {
        textAreaArray[i].addEventListener('keydown', function (e) {
            if (e.keyCode === 9) { // tab was pressed
                // get caret position/selection
                var start = this.selectionStart;
                var end = this.selectionEnd;

                var target = e.target;
                var value = target.value;

                // set textarea value to: text before caret + tab + text after caret
                target.value = value.substring(0, start)
                    + "\t"
                    + value.substring(end);

                // put caret at right position again (add one for the tab)
                this.selectionStart = this.selectionEnd = start + 1;

                // prevent the focus lose
                e.preventDefault();
            }
        }, false);
    }


    $('.note')
	return false; 
}

function newUANote(colNo, colId, noteId, id, desc, order, left, top) {
    var noteTemp = '<div class="note" ondragstart="drag(event)" ondragover="allowDrop(event)">'
        + '<a type="button" id = "delete_Note' + noteId + '" class="button_note remove"><i class="fas fa-times"></i></a>'
        + '<input type="text" id = "link' + noteId + '" value="' + id + '" style="display: none;"/>'
        + '<input type="text" id = "order' + noteId + '" value="' + order + '" style="display: none;"/>'
        + '<div class="note_cnt" id="note' + noteId + '_cnt" draggable="false">'
        + '<div id="note' + noteId + '_Text2" draggable="false"><textarea id="text' + noteId + '" class="cnt note-text" draggable="false" placeholder="Enter details here">' + desc + '</textarea></div>'
        + '</div> '
        + '</div>';

    $(noteTemp).attr('id', 'note' + noteId).hide().appendTo(colId).show("fade", 300,
        function () {
            $('#note' + noteId).css({ "display": "inline", "position": "absolute", "margin": "0px", "left": left + "px", "top": top + "px", "z-index": noteZindex++, 'border': 'none 1px red' });
        });

    //Set note to draggable
    $('#note' + noteId).attr('draggable', 'true');

    //Find offset of note on mouse down
    $('#note' + noteId).mousedown(function (e) {
        offsetX = (parseInt(e.pageX) - parseInt($('#note' + noteId).offset().left))/1.6;
        offsetY = (parseInt(e.pageY) - parseInt($('#note' + noteId).offset().top))/1.6;
    });

    $('a[id ^= "delete_Note' + noteId + '"]').on('click', function (event) {
        var noteId = $(this).parent().attr('id');
        var columnId = $(this).parent().parent().parent().attr('id');
        deleteNote(noteId, columnId);
    });

    $('#text' + noteId).on('input', function (e) {
        url = 'https://localhost:44382/api/notes/';
        var noteDesc = JSON.stringify($('#text' + noteId).val());
        id = $('#link' + noteId).val();
        var updateString = '[{"op": "add","path": "/postit_Desc","value": ' + noteDesc + '}]';
        patchNote('https://localhost:44382/api/notes/', updateString, colId, colNo, noteId, id, desc);
    });

    //Set textarea to autogrow
    $('#text' + noteId).autogrow();

    /*Set note draggable condition based on focus state*/
    $('#text' + noteId).on('focus', function (e) {
        var currentZindex = parseInt($(this).css('z-index'), 10);
        console.log('this is the zindex' + currentZindex);
        $('#note' + noteId).attr('draggable', 'false');
        focusId = $(this).parent().parent().parent().parent().parent().attr('id');
        if (blurId != focusId && blurId != "") {
            $('#' + blurId).attr('draggable', 'true');
        }
        $('#' + $(this).parent().parent().parent().parent().parent().attr('id')).attr('draggable', 'false');
    });
    /*Set note draggable condition based on focus state*/
    $('#text' + noteId).on('blur', function (e) {
        $('#note' + noteId).attr('draggable', 'true');
        $('#' + $(this).parent().parent().parent().parent().parent().attr('id')).attr('draggable', 'true');
        blurId = $(this).parent().parent().parent().parent().parent().attr('id');
        $(this).css('border', 'none 1px red');
    });

    var textAreaArray = document.querySelectorAll("textarea");
    for (var i = textAreaArray.length - 1; i >= 0; i--) {
        textAreaArray[i].addEventListener('keydown', function (e) {
            if (e.keyCode === 9) { // tab was pressed
                // get caret position/selection
                var start = this.selectionStart;
                var end = this.selectionEnd;

                var target = e.target;
                var value = target.value;

                // set textarea value to: text before caret + tab + text after caret
                target.value = value.substring(0, start)
                    + "\t"
                    + value.substring(end);

                // put caret at right position again (add one for the tab)
                this.selectionStart = this.selectionEnd = start + 1;

                // prevent the focus lose
                e.preventDefault();
            }
        }, false);
    }

    $('.note')
    return false;
}
/*lock column prevent removal of notes and delete of column*/
function lockColumn(id) {
    var dragid = ($('#' + id).attr('draggable') == 'true') ? 'false' : 'true';
    var dragover = ($('#' + id).attr('ondragover') == 'allowDrop(event)') ? 'event.stopPropagation()' : 'allowDrop(event)';
    $('#' + id).attr('draggable', dragid);
    $('#' + id).attr('ondragover', dragover);
    $('#add_new' + id.substring(4, 9)).toggleClass('disable-menu-items'); 
    $('#delete_col' + id.substring(4, 9)).toggleClass('disable-menu-items');
    var disableId = ($('#' + id).attr('draggable') == 'true') ? false : true;
    $('#head' + id.substring(4, 9)).attr("disabled", disableId);
    $('#iput' + id.substring(4, 9)).attr("disabled", disableId);
    $('#' + id).find('.note').each(function () {
        var childId = $(this).attr('id');
        $('#delete_Note' + childId.substring(4, 9)).toggleClass('disable-menu-items'); 
        dragid = ($('#' + childId).attr('draggable') == 'true') ? 'false' : 'true';
        dragover = ($('#' + childId).attr('ondragover') == 'allowDrop(event)') ? 'event.stopPropagation()' : 'allowDrop(event)';
        $('#' + childId).attr('draggable', dragid);
        $('#' + childId).attr('ondragover', dragover);
        $('#' + childId).find('.cnt').each(function () {
            var grandchildId = $(this).attr('id');
            $('#' + grandchildId).attr("disabled", disableId);
        });
    });
}
/*delete column if column is not locked and all notes have been removed from column*/
function deleteColumn(id,columnId) {
    var dragid = ($('#' + id).attr('draggable') == 'true') ? 'true' : 'false';
    var noteid = $('#' + id + ' div:nth-child(3)').attr('id'); noteid = $('#' + noteid + ' div:nth-child(1)').attr('id');
    if (dragid == 'true') {
        if (noteid == null) {
            $('#' + id).remove();
            delColumn('https://localhost:44382/api/column',columnId);
        }
        else {
            alert('Please remove all notes before deleting Column');
        }
    }
    else {
        alert('Column is locked.  Please unlock Column before delete');
    }
}

/*lock Note prevent editing or moving of note*/
function lockNote(id) {
    var dragstart = ($('#' + id).attr('ondragstart') == 'drag(event)') ? 'dragStop(event)' : 'drag(event)'; 
    $('#' + id).attr('ondragstart', dragstart);
    var dragover = ($('#' + id).attr('ondragover') == 'allowDrop(event)') ? 'event.stopPropagation()' : 'allowDrop(event)';
    $('#' + id).attr('ondragover', dragover);
    var readOnly = ($('#text' + id).prop('readonly') == "") ? "true" : "";
    $("#text" + id).prop("readonly", readOnly); 
    $('#delete_Note' + id).toggleClass('disable-menu-items');
    var noteLock = JSON.stringify($('#lock' + id).val());
    id = $('#link' + id).val();
    var updateString = '[{"op": "add","path": "/postit_Locked","value": ' + noteLock + '}]';
    patchNote('https://localhost:44382/api/notes/', updateString, colId, colNo, noteId, id, desc);
}
/*Close note.  Once note is closed, note will not display in column unnless specific request made to show closed notes*/
function closeNote(id) {
    var dragstart = ($('#' + id).attr('ondragstart') == 'drag(event)') ? 'dragStop(event)' : 'drag(event)';
    $('#' + id).attr('ondragstart', dragstart);
    var dragover = ($('#' + id).attr('ondragover') == 'allowDrop(event)') ? 'event.stopPropagation()' : 'allowDrop(event)';
    $('#' + id).attr('ondragover', dragover);
    var noteClose = JSON.stringify($('#close' + id).val());
    id = $('#link' + id).val();
    var updateString = '[{"op": "add","path": "/postit_Closed","value": ' + noteClose + '}]';
    patchNote('https://localhost:44382/api/notes/', updateString, colId, colNo, noteId, id, desc);

    //$('#delete_Note' + id.substring(4, 9)).toggleClass('disable-menu-items');


}
/*delete note from parent column.  If column is locked note will not be able to be deleted.  Column will need to be unlocked before delete can take place*/
function deleteNote(note, bord) {
    var dragid = ($('#' + bord).attr('draggable') == 'true') ? 'true' : 'false';
    if (dragid == 'true') {
        delNote('https://localhost:44382/api/notes/', parseInt($('#link' + note.substring(4, 9)).val()));
        $('#' + note).remove();
    }
    else {
        alert('Column is locked.  Please unlock Column before deleting note');
    }
 }
/*manage dropping of note or column */
function drop(ev) {
    if (dropTarget.substring(0, 4) == 'note' || dropTarget.substring(0, 4) == 'bord' || dropTarget.substring(0, 4) == 'body' || dropTarget.substring(0, 4) == 'text') {
        ev.preventDefault();
        dropTarget = ((ev.target.id).substring(0, 4) == 'text') ? $('#note' + (ev.target.id).substring(4, 9)).parent().attr('id') : dropTarget;
        var dropel = (ev.target.parentNode.id).substring(0, 9);
        var dropel1 = ((ev.target.id).substring(0, 4) == 'text') ? 'note' + (ev.target.id).substring(4, 9) : (ev.target.id).substring(0, 9);
        if (dropTarget.substring(0, 4) == "bord" && data.substring(0, 4) == "bord") {
            alert('Warning - Column move failed cannot Drop a column on another column!');
            $('.col').css('border', '1px none red');
        }
        else {
            /*select col order value from input field to identify Work Area array*/
            if (dropTarget.substring(0, 4) != 'body') {
                var col = $("#order" + ($("#" + dropTarget).parent().attr("id").substring(4, 9))).attr("value");
            }
            /*Update Column Id for notes dragged and dropped on another column*/
            if (dropTarget.substring(0, 4) != 'body') {
                /*Return Column Id note dropped onto*/
                var sClass = 0;
                if ($('#' + dropTarget).parent().attr('class').indexOf(' ') == -1) {
                    sClass = 'div.' + ($('#' + dropTarget).parent().attr('class'));
                }
                else {
                    sClass = 'div.' + ($('#' + dropTarget).parent().attr('class')).substr(0, ($('#' + dropTarget).parent().attr('class')).indexOf(' '));
                }
                postColId = $('#link' + (ev.target.closest(sClass).id).substring(4, 9)).val();
                reorderNotes(postColId, postitId, ev, dragFrom);
            }
            /*Remove red drag border from dragged object*/
            document.getElementById(data).style.border = 'none 1px red';

            /*Insert notes dropped on column and not on workspace or workarea*/
            if (data.substring(0, 4) == 'note' && $('#' + dropel1).parent().attr('id') != workSpace[col] && $('#' + dropel1).parent().attr('id') != workArea[col]) {
                //console.log('prev Note 1 data = ' + data, col, $('#' + dropel1).parent().attr('id'), workSpace[col], workArea[col]);
                var prevDiv = document.getElementById(prevNote);
                dropel1 = (prevDiv.parentNode.id == dropTarget) ? dropel1 = prevNote : dropel1 = dropTarget;
                if (dropel1 == dropTarget) {
                    div = document.getElementById(dropTarget);
                    div.insertBefore(document.getElementById(data), div.nextSibling);
                }
                else if (dropVer == "up") {
                    var div = document.getElementById(dropel1);
                    div.parentNode.insertBefore(document.getElementById(data), div);
                }
                else {
                    var div = document.getElementById(dropel1);
                    div.parentNode.insertBefore(document.getElementById(data), div.nextSibling);
                }
                /*Set style to default display view for columns.  If note dragged from column remove positioning style used by WorkArea and WorkSpace*/
                var col = $("#order" + ($("#" + dragFrom).parent().attr("id").substring(4, 9))).attr("value");
                if (dragFrom == workSpace[col]) {
                    $('#' + data).css({ "display": "", "position": "", "margin": "", "left": "", "top": "", "z-index": "" });
                }
            }
            else if (data.substring(0, 4) == 'note' && ($('#' + dropel1).parent().attr('id') == workSpace[col] || $('#' + dropel1).parent().attr('id') == workArea[col])) {
                /*Insert notes onto WorkSpace or WorkArea when dragged from another WorkSpace or Column*/
                if (dropTarget.substring(0, 4) == "body") {
                    alert('Warning - Note move failed cannot drop note outside of columns!');
                    $('.note').css('border', '1px none red');
                }
                else {
                    if (dropel1.substring(0, 4) == 'note') {
                        var div = document.getElementById(dropel1);
                        div.parentNode.insertBefore(document.getElementById(data), div.nextSibling);
                        console.log('drop on 1');
                    }
                    else {
                        var div = document.getElementById(dropel1);
                        div.insertBefore(document.getElementById(data), div.nextSibling);
                        console.log('drop on 2');
                    }
                    /*collect position where note is dropped on the screen then calculated the relative position to the top left of the container and then position the note to stick to that position*/
                    var e = e || window.event; var dragX2 = parseInt(e.pageX); var dragY2 = parseInt(e.pageY);
                    var elm1 = $('#' + workSpace[col]);
                    var dragX = Math.round((dragX2 - (parseInt(elm1.offset().left)))-offsetX);
                    var dragY = Math.round((dragY2 - (parseInt(elm1.offset().top)))-offsetY);
                    console.log('dragX ' + dragX);
                    console.log('dragY ' + dragY);
                    /*add the positioning style to the note*/
                    $('#' + data).css({ "display": "inline", "position": "absolute", "margin": "0px", "left": dragX + "px", "top": dragY + "px", "z-index": noteZindex++, 'border': 'none 1px red' });
                    var noteid = data.substring(4, 9);
                    /*update the style data to the note in the database so position can be retained when re-loaded*/
                    postitId = $('#link' + noteid).val();
                    var updateString = '[{"op": "add","path": "/postit_Col_Id","value": ' + postColId + ' },{"op": "add","path": "/postit_Order","value": ' + noteZindex + ' },{"op": "add","path": "/postit_Position_Left","value": ' + dragX + ' },{"op": "add","path": "/postit_Position_Top","value": ' + dragY + ' }]';
                    patchNote('https://localhost:44382/api/notes/', updateString, dropel, postColId, dropel1, postitId, desc);
                }
            }
            else if (dropel1 == 'body' && data.substring(0, 4) == 'bord') {
                console.log('data = bord && dopel1 = body');
                if (dropDir == "left") {
                    dropel = ($("#" + prevCol).parent().attr("id").substring(0, 4) != 'bord') ? dropel = $("#" + prevCol).parent().parent().attr("id") : dropel = $("#" + prevCol).parent().attr("id");
                    var div = document.getElementById(dropel);
                    if (div == null) {
                        div = document.getElementById(data);
                    }
                    div.parentNode.insertBefore(document.getElementById(data), div);
                }
                else {
                    dropel = ($("#" + prevCol).parent().attr("id").substring(0, 4) != 'bord') ? dropel = $("#" + prevCol).parent().parent().attr("id") : dropel = $("#" + prevCol).parent().attr("id");
                    var div = document.getElementById(dropel);
                    if (div == null) {
                        div = document.getElementById(data);
                    }
                    div.parentNode.insertBefore(document.getElementById(data), div.nextSibling);
                }
            }
            else {
                /*catch and handle all that has passed through*/
                var div = document.getElementById(dropel1);
                div.insertBefore(document.getElementById(data), div.nextSibling);
            }
            //Re-order column after dragged and dropped of column so that column will be returned in correct order
            if (dropTarget.substring(0, 4) == 'body') {
                //var colNo = ($('#body').children().length).toString(); delete code variable not used
                /*Column note dragged from - Number each note from first to last to ensure notes are returned in the same order at refresh*/
                var ctr = 0;
                $('#body').children('div.col').each(function () {
                    ctr++;
                    var columnId = $('#link' + $(this).attr('id').substring(4, 9)).val();
                    var updateString = '[{"op": "add","path": "/column_Order","value": ' + ctr + ' }]';
                    patchCol('https://localhost:44382/api/column/', columnId, updateString);
                });
            }
        }
            /*Reset drop target to null to prevent underlying Div's from triggering the drop*/
            dropTarget = "";
    }
}
function allowDrop(ev) {
    ev.preventDefault();
     if ((ev.target.id).substring(0, 9) != '') {
         dropTarget = (ev.target.id).substring(0, 9);
         if (dropTarget.substring(0, 5) == data.substring(0, 5)) {
             prevNote = dropTarget;
         }
         
         if (dropTarget.substring(0, 5) != data.substring(0, 5)) {
             if (dropTarget.substring(0, 5) != "body") {
                 prevCol = dropTarget;
             }
             else {
                 dropTarget = 'body';
             }  
         }
         else {
                 dropTarget = (ev.target.parentNode.id).substring(0, 9);
         }
     } 
    /*Track drag direction to determine if dragged items are placed left or right / above or below the drop point*/
    var e = e || window.event;
    var dragX = e.pageX, dragY = e.pageY;
    if (dragX > prevX) {
            dropDir = "right";
    }
    else if (dragX < prevX) {
            dropDir = "left";
    }
    if (dragY > prevY) {
            dropVer = "down";
    }
    else if (dragY < prevY) {
            dropVer = "up";
    }
    prevX = dragX;
    prevY = dragY;
}

function dragEnd(ev) {
    data = ev.target.id;
    $('.colUA').css('border', '1px none red');
}

function drag(ev) {
    data = ev.target.id;
    if ($('#' + data).hasClass('chat-col')) {
        dragFrom = ev.target.closest('div').id.substring(0, 9);
        ev.target.style.border = 'solid 1px blue';
    }
    else if ($('#' + data).hasClass('col')) {
        dragFrom = ev.target.closest('div').id.substring(0, 9);
        ev.target.style.border = 'solid 1px red';
    }
    else if ($('#' + data).hasClass('colUA')) {
        dragFrom = ev.target.closest('div').id.substring(0, 9);
        ev.target.style.border = 'solid 1px red';
    }
    else if ($('#' + data).hasClass('note')) {
        dragFrom = ev.target.parentNode.id
        ev.target.style.border = 'none 1px red';
    }
    else {
        dragFrom = ev.target.closest('div.scrollbar').id.substring(0, 9);
        ev.target.style.border = 'solid 1px red';
    }
    desc = $('#text' + (data).substring(4, 9)).val();
    postitId = $('#link' + (data).substring(4, 9)).val();
}

function dragStop(ev) {
    ev.preventDefault();
    alert('This note is currently locked - Please unlock the note to move or edit');
    /*Stop the drag event from bubbling up the DOM*/
    event.stopPropagation();
}
//style="position: -webkit-sticky;position: sticky; position: fixed; top: '+setTop+'px; right: '+setRight+'px;float: right;z-index: ' + colUAZindex++ +'"
/*Create group chat function*/
function addChat(boardId) {
    $('#bord').before('<div class="chat-col draggable" id = "bord' + boardId + '" ondragstart = "drag(event)" style="z-index: '+ colUAZindex++ + '">'
        + '<div id="menu' + boardId + '" class="chat_menu"><div style="float: left;padding-top:5px;">Group Chat</div>'
        + '<a type="button" style="float:right;" id = "delete_chat' + boardId + '"><i class="fas fa-times chaticon" style="padding:3px 5px 3px 5px;"></i></a>'
        + '<a type="button" style="float:right;" id = "max_chat' + boardId + '"><i class="fas fa-window-restore chaticon" style="padding:0px 5px 0px 5px;"></i></a>'
        + '<a type="button" style="float:right;" id = "min_chat' + boardId + '"><i class="fas fa-window-minimize chaticon" style="padding:3px 5px 3px 5px;"></i></a></div>'
        + '<div style="padding: 5px 10px 5px 10px;">'
        + '<div class="col-2"  style="padding-top: 20px;padding-bottom: 5px;">User:</div><div class="col-4" style="padding-bottom: 5px;"><input type="text" id="userInput" /></div>'
        + '<div class="col-2"  style="padding-bottom: 5px;">Message:</div><div class="col-10" style="padding-bottom: 10px;"><input type="text" id="messageInput" style="width: 100%;" /></div>'
        + '<div class="col-6"  style="padding-bottom: 5px;"><input type="button" id="sendButton" value="Send Message" /></div>'
        + '</div>'
        + '<div class="col-12">'
        + '<hr />'
        + '</div>'
        + '<div>'
        + '<div class="col-6">&nbsp;</div>'
        + '<div class="col-6">'
        + '<ul id="messagesList" class="scrollbar bord-scroll bord-track bord-thumb" style="width: 240px; height: 400px; overflow: auto"></ul>'
        + '</div>'
        + '</div>');
    /*Set column dragable*/
    $('#bord' + boardId).attr('draggable', 'true');

    /*Delete selected column. */
    $('a[id ^= "delete_chat' + boardId + '"]').on('click', function (event) {
        var column = $(this).parent().parent().attr('id');
        $('#' + column).remove();
    });

    $('a[id ^= "min_chat' + boardId + '"]').on('click', function (event) {
        var column = $(this).parent().parent().attr('id');
        $('#' + column).css({ "height": "150px" });
    });

    $('a[id ^= "max_chat' + boardId + '"]').on('click', function (event) {
        var column = $(this).parent().parent().attr('id');
        $('#' + column).css({ "height": "" });
    });
    $(function () {
        $(".chat-col").draggable({
            handle: $('#menu' + boardId), stop: function dragEnd(ev) {
                data = ev.target.id;
                $('.chat-col').css('border', '1px solid grey');
            }
        });
/*move the work area to the top as the item is dragged over the other work areas by increasing the z-index*/
        $("#bord" + boardId).droppable({
            over: function (event, ui) {
                $("#" + dragFrom).css("z-index", colUAZindex++);
            }
        });
    });

     "use strict";

    var connection = new signalR.HubConnectionBuilder().withUrl("/chatHub").build();

    //Disable send button until connection is established

    document.getElementById("sendButton").disabled = true;

    connection.on("ReceiveMessage", function (user, message) {
        var msg = message.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
        var encodedMsg = user + " says " + msg;
        var li = document.createElement("li");
        li.textContent = encodedMsg;
        document.getElementById("messagesList").appendChild(li);
    });

    connection.start().then(function () {
        document.getElementById("sendButton").disabled = false;
    }).catch(function (err) {
        return console.error(err.toString());
    });

    document.getElementById("sendButton").addEventListener("click", function (event) {
        var user = document.getElementById("userInput").value;
        var message = document.getElementById("messageInput").value;
        connection.invoke("SendMessage", user, message).catch(function (err) {
            return console.error(err.toString());
        });
        event.preventDefault();
    });
}

/*Create group WhiteBoard function*/
function addBoard(boardId, height, width) {
    var hCanvas = (parseInt(height)-120);
    var wCanvas = (parseInt((parseInt(width) / 100) * 98));
    /*set column height of board to equal screen height*/
    $('#bord').before('<div class="board-col" id = "bord' + boardId + '" style="width: '+ wCanvas +'px; height: '+ hCanvas + 'px; position: absolute; z-index: 1000001;">'
        + '<div id="menu' + boardId + '" class="board_menu"><div style="float: left;padding-bottom:0px;padding-left: 10px;">Whiteboard</div>'
        + '<a type="button" style="float:right;" id = "delete_board' + boardId + '"><i class="fas fa-times boardicon" style="padding:5px 5px 3px 5px;"></i></a>'
        + '<a type="button" style="float:right;" id = "max_board' + boardId + '"><i class="fas fa-window-restore boardicon" style="padding:5px 5px 0px 5px;"></i></a>'
        + '<a type="button" style="float:right;" id = "min_board' + boardId + '"><i class="fas fa-window-minimize boardicon" style="padding:5px 5px 3px 15px;"></i></a>'
        + '<div class="dropdown"><button class="dropbtn-menu dropdown-whiteboard" id = "clr_board' + boardId + '">Colour</button>'
        + '<div class="dropdown-content dropdown-whiteboard" style="min-width: 100px;">'
        + '<a type="button" id = "color_blue"><i class="fas fa-tint boardicon-blue" style="padding:5px 10px 5px 5px;"></i>Blue</a>'
        + '<a type="button" id = "color_red"><i class="fas fa-tint boardicon-red" style="padding:5px 10px 5px 5px;"></i>Red</a>'
        + '<a type="button" id = "color_yellow"><i class="fas fa-tint boardicon-yellow" style="padding:5px 10px 5px 5px;"></i>Yellow</a>'
        + '<a type="button" id = "color_green"><i class="fas fa-tint boardicon-green" style="padding:5px 10px 5px 5px;"></i>Green</a>'
        + '<a type="button" id = "color_black"><i class="fas fa-tint boardicon-black" style="padding:5px 10px 5px 5px;"></i>Black</a>'
        + '</div>'
        + '</div>'
        + '<div class="dropdown"><button class="dropbtn-menu dropdown-whiteboard" id = "clr_board' + boardId + '">Size</button>'
        + '<div class="dropdown-content dropdown-whiteboard" style="min-width: 100px;">'
        + '<a type="button" id = "width5"><i class="fas fa-pen boardicon-pen5" style="padding:5px 10px 5px 5px;"></i>50</a>'
        + '<a type="button" id = "width4"><i class="fas fa-pen boardicon-pen4" style="padding:5px 11px 5px 5px;"></i>40</a>'
        + '<a type="button" id = "width3"><i class="fas fa-pen boardicon-pen3" style="padding:5px 12px 5px 5px;"></i>30</a>'
        + '<a type="button" id = "width2"><i class="fas fa-pen boardicon-pen2" style="padding:5px 13px 5px 5px;"></i>20</a>'
        + '<a type="button" id = "width1"><i class="fas fa-pen boardicon-pen1" style="padding:5px 14px 5px 5px;"></i>10</a>'
        + '</div>'
        + '</div>'
        + '<div class="dropdown"><button class="dropbtn-menu dropdown-whiteboard" id = "clr_board' + boardId + '">Eraser</button>'
        + '<div class="dropdown-content dropdown-whiteboard" style="min-width: 100px;">'
        + '<a type="button" id = "erase5"><i class="fas fa-eraser boardicon-pen5" style="padding:5px 10px 5px 5px;"></i>50</a>'
        + '<a type="button" id = "erase4"><i class="fas fa-eraser boardicon-pen4" style="padding:5px 11px 5px 5px;"></i>40</a>'
        + '<a type="button" id = "erase3"><i class="fas fa-eraser boardicon-pen3" style="padding:5px 12px 5px 5px;"></i>30</a>'
        + '<a type="button" id = "erase2"><i class="fas fa-eraser boardicon-pen2" style="padding:5px 13px 5px 5px;"></i>20</a>'
        + '<a type="button" id = "erase1"><i class="fas fa-eraser boardicon-pen1" style="padding:5px 14px 5px 5px;"></i>10</a>'
        + '</div>'
        + '</div>'
        + '<div class="dropdown"><button class="dropbtn-menu dropdown-whiteboard" id = "clr_board' + boardId + '">Draw</button>'
        + '<div class="dropdown-content dropdown-whiteboard" style="min-width: 100px;">'
        + '<a type="button" id = "line7"><i class="fas fa-arrows-alt-h boardicon-pen5" style="padding:5px 10px 5px 5px;"></i>Arrow</a>'
        + '<a type="button" id = "line6"><i class="fas fa-arrow-right boardicon-pen5" style="padding:5px 10px 5px 5px;"></i>Arrow</a>'
        + '<a type="button" id = "line5"><i class="fas fa-circle boardicon-pen4" style="padding:5px 11px 5px 5px;"></i>Circle</a>'
        + '<a type="button" id = "line4"><i class="fas fa-square boardicon-pen3" style="padding:5px 12px 5px 5px;"></i>Square</a>'
        + '<a type="button" id = "line3"><i class="fas fa-slash boardicon-pen2" style="padding:5px 13px 5px 5px;"></i>Line</a>'
        + '<a type="button" id = "line2"><i class="fas fa-signature boardicon-pen1" style="padding:5px 14px 5px 5px;"></i>Draw</a>'
        + '<a type="button" id = "line1"><i class="fas fa-caret-up boardicon-pen0" style="padding:5px 14px 5px 5px;"></i>Triangle</a>'
        + '</div>'
        + '</div>'
        + '<label class="color-picker"><input type="color" id="selectColor" style="float:right; visibility: hidden;"/><div id="selectClr" class="fas fa-eye-dropper boardicon-select" style="padding: 5px 5px 3px 5px; color: #000000"></div></label>'
        + '<a type="button" style="float:right;" id = "board_BG"><i class="fas fa-clone boardicon-clone" style="padding:5px 5px 3px 5px;"></i></a>'
        + '<a type="button" style="float:right;" id = "resize"><i class="fas fa-compress boardicon-save" style="padding:5px 5px 3px 5px;"></i></a>'
        + '<a type="button" style="float:right;" id = "downloadLnk"><i class="fas fa-save boardicon-save" style="padding:5px 5px 3px 5px;"></i></a>'
        + '<input type="text" style="float:right; font-weight: 100; font-size: 10pt; width: 150px; display: none;" id="fileName" name="fileName"/>'
        + '<label class="color-picker"><input type="file" style="float:right; font-weight: 100; font-size: 10pt; width: 5px; visibility: hidden;" id="imageLoader" name="imageLoader"/><div id="selectClr" class="fas fa-file boardicon-select" style="padding: 5px 5px 3px 5px; color: #000000"></div></label>'
        + '<div style="padding: 0px;"><BR>'
        + '<canvas id="canvas" width = ' + parseInt(wCanvas-3) + ' height = ' + parseInt(hCanvas-45) + ' onmouseout="clearMousePositions()"></canvas>'
        + '</div></div></div>');

    /*Set column dragable*/
    $('#bord' + boardId).attr('draggable', 'false');

    var imageLoader = document.getElementById('imageLoader');
    imageLoader.addEventListener('change', loadImage, false);

    downloadLnk.addEventListener('click', downloadFiles, false);

    var selectColor = document.getElementById('selectColor');
    selectColor.addEventListener('change', userColor, false);

    /*Delete selected column. */
    $('a[id ^= "delete_board' + boardId + '"]').on('click', function (event) {
        var column = $(this).parent().parent().attr('id');
        $('#' + column).remove();
    });

    $('a[id ^= "min_board' + boardId + '"]').on('click', function (event) {
        var column = $(this).parent().parent().attr('id');
        $('#' + column).css({ "height": "150px" });
    });

    $('a[id ^= "max_board' + boardId + '"]').on('click', function (event) {
        var column = $(this).parent().parent().attr('id');
        $('#' + column).css({ "height": "" });
    });

    canvas = $("#canvas");
    ctx = canvas[0].getContext('2d');
    var hCanvas = (parseInt(pageHeight));
    var wCanvas = ((parseInt(pageWidth) / 100) * 98.5);
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, wCanvas, hCanvas);
    clr = 'black'; type = 'source-over'; drawType ='random';

    /*Set Colour of line*/
    $('a[id ^= "color_black"]').on('click', function (event) {
        clr = 'black';
        type = 'source-over';
    });
    $('a[id ^= "color_red"]').on('click', function (event) {
        clr = 'red';
        type = 'source-over';
    });
    $('a[id ^= "color_yellow"]').on('click', function (event) {
        clr = 'yellow';
        type = 'source-over';
    });
    $('a[id ^= "color_green"]').on('click', function (event) {
        clr = 'green';
        type = 'source-over';
    });
    $('a[id ^= "color_blue"]').on('click', function (event) {
        clr = 'blue';
        type = 'source-over';
    });
    /*Set width of line*/
    $('a[id ^= "width1"]').on('click', function (event) {
        wth = 1;
        type = 'source-over';
    });
    $('a[id ^= "width2"]').on('click', function (event) {
        wth = 3;
        type = 'source-over';
    });
    $('a[id ^= "width3"]').on('click', function (event) {
        wth = 5;
        type = 'source-over';
    });
    $('a[id ^= "width4"]').on('click', function (event) {
        wth = 8;
        type = 'source-over';
    });
    $('a[id ^= "width5"]').on('click', function (event) {
        wth = 10;
        type = 'source-over';
    });
    /*Set the action to erase and line width 10*/
    $('a[id ^= "erase5"]').on('click', function (event) {
        type = 'destination-out';
        wth = 12;
        drawType = 'random';
    });
    $('a[id ^= "erase4"]').on('click', function (event) {
        type = 'destination-out';
        wth = 10;
        drawType = 'random';
    });
    $('a[id ^= "erase3"]').on('click', function (event) {
        type = 'destination-out';
        wth = 8;
        drawType = 'random';
    });
    $('a[id ^= "erase2"]').on('click', function (event) {
        type = 'destination-out';
        wth = 6;
        drawType = 'random';
    });
    $('a[id ^= "erase1"]').on('click', function (event) {
        type = 'destination-out';
        wth = 4;
        drawType = 'random';
    });
/*Set the action to select drawing tool*/
    $('a[id ^= "line7"]').on('click', function (event) {
        type = 'source-over';
        drawType = 'arrow2';
    });
    $('a[id ^= "line6"]').on('click', function (event) {
        type = 'source-over';
        drawType = 'arrow1';
    });
    $('a[id ^= "line5"]').on('click', function (event) {
        type = 'source-over';
        drawType = 'circle';
    });
    $('a[id ^= "line4"]').on('click', function (event) {
        wth = 1;
        type = 'source-over';
        drawType = 'square';
    });
    $('a[id ^= "line3"]').on('click', function (event) {
        type = 'source-over';
        drawType = 'straight';
    });
    $('a[id ^= "line2"]').on('click', function (event) {
        type = 'source-over';
        drawType = 'random';
    });
    $('a[id ^= "line1"]').on('click', function (event) {
        type = 'source-over';
        drawType = 'triangle';
    });
    /*Set background color between white and transparent*/
    $('a[id ^= "board_BG"]').on('click', function (event) {
        $("#bord" + boardId).toggleClass("board-col-bg");

        var hCanvas = (parseInt(pageHeight));
        var wCanvas = ((parseInt(pageWidth) / 100) * 98.5);
        ctx.clearRect(0, 0, wCanvas, hCanvas);
    });
    /*Set resize of image and canvas*/
    $('a[id ^= "resize"]').on('click', function (event) {
        var hCanvas = (parseInt(pageHeight));
        var wCanvas = ((parseInt(pageWidth) / 100) * 98.5);
        var pDiv = 'bord' + boardId;
        resizeWhiteBoard(hCanvas, wCanvas, pDiv);

    });

    $(function () {
        $('.board-col').css('border', '1px solid grey');
        /*move the work area to the top as the item is dragged over the other work areas by increasing the z-index*/
        $("#bord" + boardId).droppable({
            over: function (event, ui) {
                $("#" + dragFrom).css("z-index", colUAZindex++);
            }
        });
    });

    "use strict";

    var CLIPBOARD = new CLIPBOARD_CLASS("canvas", false);

    connection = new signalR.HubConnectionBuilder()
        .withUrl('/draw')
        .build();

    /*connection.on('draw', function (prev_x, prev_y, x, y, clr, wth, type) {
        rawCanvas(prev_x, prev_y, x, y, clr, wth, type);
    });*/
    connection.start();

    // calculate where the canvas is on the window these vars will hold the starting mouse position
    var $canvas = $("#canvas");
    var canvasOffset = $canvas.offset();
    var offsetX = canvasOffset.left;
    var offsetY = canvasOffset.top;
    var canvasx = $(canvas).offset().left;
    var canvasy = $(canvas).offset().top;
    var mousex = mousey = 0;
    // listen for mouse events
    $("#canvas").mousedown(function (e) {
        if (drawType == 'square') {
            squareMouseDown(e, canvasOffset, offsetX, offsetY);
        }
        else if (drawType == 'random') {
            randomMouseDown(e, canvasOffset, canvasx, canvasy);
        }
        else if (drawType == 'circle') {
            circleMouseDown(e, canvasOffset, offsetX, offsetY);
        }
        else if (drawType == 'triangle') {
            triangleMouseDown(e, canvasOffset, offsetX, offsetY);
        }
        else if (drawType == 'straight') {
            lineMouseDown(e, canvasOffset, offsetX, offsetY);
        }
        else if (drawType == 'arrow1') {
            arrowLineMouseDown(e, offsetX, offsetY);
        }
        else if (drawType == 'arrow2') {
            arrowLineMouseDown(e, offsetX, offsetY);
        }
    });
    $("#canvas").mousemove(function (e) {
        if (drawType == 'square') {
            squareMouseMove(e, canvasOffset, startX, startY, offsetX, offsetY);
        }
        else if (drawType == 'random') {
            randomMouseMove(e, canvasOffset, canvasx, canvasy, mousex, mousey);
        }
        else if (drawType == 'circle') {
            circleMouseMove(e, canvasOffset, offsetX, offsetY);
        }
        else if (drawType == 'triangle') {
            triangleMouseMove(e, canvasOffset, offsetX, offsetY);
        }
        else if (drawType == 'straight') {
            lineMouseMove(e, canvasOffset, offsetX, offsetY);
        }
        else if (drawType == 'arrow1') {
            arrowLineMouseMove(e);
        }
        else if (drawType == 'arrow2') {
            arrowLineMouseMove(e);
        }
    });
    $("#canvas").mouseup(function (e) {
        if (drawType == 'square') {
            squareMouseUp(e);
        }
        else if (drawType == 'random') {
            randomMouseUp(e);
        }
        else if (drawType == 'circle') {
            circleMouseUp(e);
        }
        else if (drawType == 'triangle') {
            triangleMouseUp(e);
        }
        else if (drawType == 'straight') {
            lineMouseUp(e, offsetX, offsetY);
        }
        else if (drawType == 'arrow1') {
            arrowLineMouseUp(e, offsetX, offsetY, 5, 8, false, true);
        }
        else if (drawType == 'arrow2') {
            arrowLineMouseUp(e, offsetX, offsetY, 5, 8, true, true);
        }
    });
    $("#canvas").mouseout(function (e) {
        if (drawType == 'square') {
            squareMouseOut(e);
        }
        else if (drawType == 'random') {
            randomMouseOut(e);
        }
        else if (drawType == 'circle') {
           circleMouseOut(e);
        }
        else if (drawType == 'triangle') {
            triangleMouseOut(e);
        }
        else if (drawType == 'straight') {
            lineMouseOut(e);
        }
        else if (drawType == 'arrow1') {
            arrowLineMouseOut(e);
        }
        else if (drawType == 'arrow2') {
            arrowLineMouseOut(e);
        }
    });

    //reset last mouse position back to home 
    clearMousePositions = function () {
        last_mousex = 0;
        last_mousey = 0;
    }
} 

$(document).ready(function () {
    pageHeight = $(window).height();
    pageWidth = $(window).width();
    $('#body').css("height", pageHeight - 85);
   /*on window resize redraw columns and notes based in the window height*/
    $(window).resize(function () {
        pageHeight = $(window).height();
        pageWidth = $(window).width();
        $('#body').css("height", pageHeight - 85);
        $('.col').css("height", pageHeight - 130);
        $('.colUA').css("height", pageHeight - 130);
        $('.col-scroll').css("height", pageHeight - 210);
    });

    $('#body').scroll(function (e) {
        scrolly = $("#body").scrollTop();
        scrollx = $("#body").scrollLeft();
        //console.log('scroll ' + $("#body").scrollTop()); // Value of scroll Y in px
    });

    $('.scrollbar.bord-scroll.bord-track.bord-thumb').on('scroll', function () {
        $(".scrollbar.bord-scroll.bord-track.bord-thumb").not(this).scrollLeft($(this).scrollLeft());
    });

    $("#edit_Proj_Button").toggle();
    $("#delete_Proj_Button").toggle();
    $('a[id^="add_Col"]').on('click', function (event) {
        addColumn('https://localhost:44382/api/column', $('#projectDD').val(), pageHeight);
    }); 

    $('a[id^="add_UACol"]').on('click', function (event) {
        if (confirm('Create New Work Area?')) {
            addUAColumn('https://localhost:44382/api/column', $('#projectDD').val(), pageHeight);
        } else {
            // Do nothing!
        }
     }); 
    /*Initiate chat activity when chat menu item id clicked*/
    $('a[id^="start_Chat"]').on('click', function (event) {
        addChat(++boardId);
    });
    /*Initiate WhiteBoard Item whe menu item is clicked*/
     $('a[id^="start_Board"]').on('click', function (event) {
        addBoard(++boardId, pageHeight, pageWidth);
     });
    /*Initiate snap shot Item whe menu item is clicked*/
    $('a[id^="snap_Board"]').on('click', function (event) {
        html2canvas(document.querySelector('#body'), { scale: 2.00, allowTaint: false, useCORS: true, windowWidth: document.documentElement.clientWidth * 1 + "px", windowHeight: document.documentElement.clientHeight * 1 + "px"}).then(function (canvas) {
            console.log(canvas);
            saveAs(canvas.toDataURL(), 'screenshot.png');
        });
    });
    /*Initiate snap shot Item whe menu item is clicked*/
    $('a[id^="clip_Board"]').on('click', function (event) {
        html2canvas(document.querySelector("#body"), { scale: 2.0, allowTaint: false, useCORS: true, windowWidth: document.documentElement.clientWidth * 1 + "px", windowHeight: document.documentElement.clientHeight * 1 + "px" }).then(canvas => canvas.toBlob(blob => navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })])));
    });

    $('a[id^="viewCol"]').on('click', function (event) {
        gridView = true;
        displayColumns('https://localhost:44382/api/column/', 'https://localhost:44382/api/notes', $('#projectDD').val(), pageHeight);
    });

    $('a[id^="viewStack"]').on('click', function (event) {
        gridView = false;
        displayColumns('https://localhost:44382/api/column/', 'https://localhost:44382/api/notes', $('#projectDD').val(), pageHeight);
    });

    $('a[id^="add_Proj"]').on('click', function (event) {
        dbFunction = 'add';
        $('#projectName1').val("");
        var active = ($('#delete_Proj_Button').css('display') == 'none') ? 'true' : 'false';
        if (active == 'false') {
            $("#delete_Proj_Button").toggle();
        }

        var active = ($('#edit_Proj_Button').css('display') == 'none') ? 'true' : 'false';
        if (active == 'true') {
            $("#edit_Proj_Button").toggle();
        }
    });
 
    $('a[id^="update_Proj"]').on('click', function (event) {
        dbFunction = 'edit';
        var active = ($('#delete_Proj_Button').css('display') == 'none') ? 'true' : 'false';
        if (active == 'false') {
            $("#delete_Proj_Button").toggle();
        }

        var active = ($('#edit_Proj_Button').css('display') == 'none') ? 'true' : 'false';
        if (active == 'true') {
            $("#edit_Proj_Button").toggle();
        }
    });

    $('a[id^="delete_Proj"]').on('click', function (event) {
        var active = ($('#delete_Proj_Button').css('display') == 'none') ? 'true' : 'false';
        if (active == 'true') {
            $("#delete_Proj_Button").toggle();
        }
        var active = ($('#edit_Proj_Button').css('display') == 'none') ? 'true' : 'false';
        if (active == 'false') {
            $("#edit_Proj_Button").toggle();
        }
    }); 

    $('a[id^="edit_Proj_Button"]').on('click', function (event) {
        if (dbFunction == 'add') {
            var projName = $('#projectName1').val();
            var active = (projName.length == 0) ? 'true' : 'false';
            if (active == 'true') {
                alert('Please enter project name.  Name cannot be blank');
            }
            axios.post('https://localhost:44382/api/process', {
                bup_Desc: projName
            })
                .then((response) => {
                    var id = JSON.parse(JSON.stringify(response.data));
                    myFunction('add', id.bup_Id);
                    console.log(response);
                }, (error) => {
                     console.log(error);
                });
        }
        if (dbFunction == 'edit') {
            var projId = $('#projectDD').val(); 
            var projName = $('#projectName1').val();
            var active = (projName.length == 0) ? 'true' : 'false';
            if (active == 'true') {
                alert('Please enter project name.  Name cannot be blank');
            }
            axios.put('https://localhost:44382/api/process/' + projId, {
                    bup_Id: projId,
                    bup_Desc: projName
            })
                .then((response) => {
                    myFunction('edit', projId);
                    console.log(response);
                }, (error) => {
                    console.log(error);
                });
        }
    }); 

    $('a[id^="delete_Proj_Button"]').on('click', function (event) {
        var projId = $('#projectDD').children('option:selected').val();
        var active = (projId.length == 0) ? 'true' : 'false';
        if (active == 'true') {
            alert('Please select project name.  Name cannot be blank');
        }
        axios.delete('https://localhost:44382/api/process/' + projId, {          
        })
            .then((response) => {
                myFunction('delete');
                console.log(response);
            }, (error) => {
                console.log(error);
            });
    }); 


    /*$("#dialog").dialog({
        autoOpen: false,
        modal: true,
        buttons: {
            "Confirm": function () {
                alert('Confirm');
                addUAColumn('https://localhost:44382/api/column', $('#projectDD').val(), pageHeight);
            },
            "Cancel": function () {
                alert('Cancel');
                $(this).dialog("close");

            }
        }
    });*/


    myFunction();

    //document.getElementById("projectName1").addEventListener("focusout", myFunction);
    return false;
});

function randomMouseDown(e, canvasOffset, canvasx, canvasy) {
    e.preventDefault();
    e.stopPropagation();
    last_mousex = mousex = parseInt((e.clientX + scrollx) - canvasx);
    last_mousey = mousey = parseInt((e.clientY + scrolly) - canvasy);
    console.log('last_mousex = ' + last_mousex + ' - last_mousey = ' + last_mousey);
    mousedown = true;
}

function randomMouseUp(e) {
    e.preventDefault();
    e.stopPropagation();
    mousedown = false;
}

function randomMouseOut(e) {
    e.preventDefault();
    e.stopPropagation();
    // the drag is over, clear the dragging flag and previous width, height variables
    mousedown = false;
}

function randomMouseMove(e, canvasOffset, canvasx, canvasy, mousex, mousey) {
    e.preventDefault();
    e.stopPropagation();
    mousex = parseInt((e.clientX + scrollx) - canvasx);
    mousey = parseInt((e.clientY + scrolly) - canvasy);
    if (mousedown) {
        drawCanvas(mousex, mousey, last_mousex, last_mousey, clr, wth, type);
        connection.invoke('draw', last_mousex, last_mousey, mousex, mousey, clr);
    }
    last_mousex = mousex;
    last_mousey = mousey;
}

function drawCanvas(prev_x, prev_y, x, y, clr, wth, type) {
    ctx.beginPath();
    ctx.globalCompositeOperation = type;
    ctx.strokeStyle = clr
    ctx.lineWidth = wth;
    ctx.moveTo(prev_x, prev_y);
    ctx.lineTo(x, y);
    ctx.lineJoin = ctx.lineCap = 'round';
    ctx.stroke();
};

function removeLine(prev_x, prev_y, x, y, clr, wth, type) {
    ctx.beginPath();
    ctx.globalCompositeOperation = type;
    ctx.strokeStyle = clr
    ctx.lineWidth = wth;
    ctx.moveTo(prev_x, prev_y);
    ctx.lineTo(x, y);
    ctx.lineJoin = ctx.lineCap = 'round';
    ctx.stroke();
};

function squareMouseDown(e, canvasOffset, offsetX, offsetY) {
    console.log('offsetX = ' + offsetX + ' - offsetY = ' + offsetY);
    e.preventDefault();
    e.stopPropagation();
    // save the starting x/y of the rectangle
    startX = parseInt((e.clientX + scrollx) - offsetX);
    startY = parseInt((e.clientY + scrolly)- offsetY);
    // set a flag indicating the drag has begun
    isDown = true;
}

function squareMouseUp(e) {
    e.preventDefault();
    e.stopPropagation();
    //reset mouse variables to default
    prevWidth = 0;
    prevHeight = 0;
    mouseX = 0;
    mouseY = 0;
    width = 0;
    height = 0;
    startX = 0;
    startY = 0;
    isDown = false;
    drawDirection = '';
}

function squareMouseOut(e) {
    e.preventDefault();
    e.stopPropagation();
    // the drag is over, clear the dragging flag and previous width, height variables
    isDown = false;
}

function squareMouseMove(e, canvasOffset, startX, startY, offsetX, offsetY) {
    e.preventDefault();
    e.stopPropagation();
    if (!isDown) {
        return;
    }
    ctx.strokeStyle = clr
    ctx.lineWidth = wth;
    var linewth = wth * 2;
    // get the current mouse position
    mouseX = parseInt((e.clientX + scrollx) - offsetX);
    mouseY = parseInt((e.clientY + scrolly) - offsetY);
    // calculate the rectangle width/height based on starting vs current mouse position
    var width = mouseX - startX;
    var height = mouseY - startY;
    // clear the previous drawn rectangle plus
    //draw the new rectangle from the starting position to the new cursor position

    ctx.clearRect(startX + wth, startY + wth, prevWidth - linewth, prevHeight - linewth);
    ctx.clearRect(startX - wth, startY - wth, prevWidth + linewth, prevHeight + linewth);
    ctx.clearRect(startX + wth, startY + wth, prevWidth - linewth, prevHeight + linewth);
    ctx.clearRect(startX - wth, startY - wth, prevWidth + linewth, prevHeight - linewth);
    ctx.clearRect(startX + wth, startY + wth, prevWidth + linewth, prevHeight + linewth);
    ctx.clearRect(startX - wth, startY - wth, prevWidth - linewth, prevHeight - linewth);
    //ctx.globalCompositeOperation = 'destination-over';
    ctx.strokeRect(startX, startY, width, height);
    //Set previous width and height to set rect clear variables
    prevWidth = width;
    prevHeight = height;
}

function circleMouseDown(e, canvasOffset, offsetX, offsetY) {
    console.log('offsetX = ' + offsetX + ' - offsetY = ' + offsetY);
    e.preventDefault();
    e.stopPropagation();
    // save the starting x/y of the rectangle
    startX = parseInt((e.clientX + scrollx) - (offsetX));
    startY = parseInt((e.clientY + scrolly) - offsetY);
    // set a flag indicating the drag has begun
    isDown = true;
}

function circleMouseMove(e, canvasOffset, offsetX, offsetY) {
    if (!isDown) {
        return;
    }
    e.preventDefault();
    e.stopPropagation();
    ctx.strokeStyle = clr
    ctx.lineWidth = wth;
    var linewth = wth * 2;
    x = parseInt((e.clientX + scrollx) - offsetX);
    y = parseInt((e.clientY + scrolly) - offsetY);
    // calculate the rectangle width/height based on starting vs current mouse position
    var width = x - startX;
    var height = y - startY;

    ctx.clearRect(startX + wth, startY + wth, prevWidth - linewth, prevHeight - linewth);
    ctx.clearRect(startX - wth, startY - wth, prevWidth + linewth, prevHeight + linewth);
    ctx.clearRect(startX + wth, startY + wth, prevWidth - linewth, prevHeight + linewth);
    ctx.clearRect(startX + wth, startY - wth, prevWidth + linewth, prevHeight - linewth);
    ctx.clearRect(startX - wth, startY + wth, prevWidth + linewth, prevHeight + linewth);
    ctx.clearRect(startX + wth, startY + wth, prevWidth + linewth, prevHeight + linewth);
    ctx.clearRect(startX - wth, startY - wth, prevWidth - linewth, prevHeight - linewth);
    //ctx.globalCompositeOperation = 'destination-over';
    ctx.beginPath();
    //ctx.strokeRect(startX, startY, width, height);
    ctx.moveTo(startX, startY + (y - startY) / 2);
    ctx.bezierCurveTo(startX, startY, x, startY, x, startY + (y - startY) / 2);
    ctx.bezierCurveTo(x, y, startX, y, startX, startY + (y - startY) / 2);
    ctx.closePath();
    ctx.stroke();
    prevWidth = width;
    prevHeight = height;
    this.zindex = i++;
}

function circleMouseUp(e) {
    if (!isDown) {
        return;
    }
    e.preventDefault();
    e.stopPropagation();
    isDown = false;
    prevWidth = 0;
    prevHeight = 0;
}

function circleMouseOut(e) {
    if (!isDown) {
        return;
    }
    e.preventDefault();
    e.stopPropagation();
    isDown = false;
    prevWidth = 0;
    prevHeight = 0;
}

function triangleMouseDown(e, canvasOffset, offsetX, offsetY) {
    console.log('offsetX = ' + offsetX + ' - offsetY = ' + offsetY);
    e.preventDefault();
    e.stopPropagation();
    // save the starting x/y of the rectangle
    startX = parseInt((e.clientX + scrollx) - offsetX);
    startY = parseInt((e.clientY + scrolly) - offsetY);
    console.log('start height = ' + startY + ' - start wudth = ' + startX);
    // set a flag indicating the drag has begun
    isDown = true;
}

function triangleMouseMove(e, canvasOffset, offsetX, offsetY) {
    if (!isDown) {
        return;
    }
    e.preventDefault();
    e.stopPropagation();
    ctx.strokeStyle = clr
    ctx.lineWidth = wth;
    var linewth = wth * 2;
    x = parseInt((e.clientX + scrollx) - offsetX);
    console.log(' x ' + x);
    y = parseInt((e.clientY + scrolly) - offsetY);
    console.log(' y ' + y);
    // calculate the triangle width/height based on starting vs current mouse position
    var width = x - startX;
    var height = y - startY;
    ctx.clearRect(startX + wth, startY + wth, prevWidth - linewth, prevHeight - linewth);
    ctx.clearRect(startX - wth, startY - wth, prevWidth + linewth, prevHeight + linewth);
    ctx.clearRect(startX + wth, startY + wth, prevWidth - linewth, prevHeight + linewth);
    ctx.clearRect(startX - wth, startY - wth, prevWidth + linewth, prevHeight - linewth);

    // the triangle
    //ctx.globalCompositeOperation = 'destination-over';
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    console.log('startX ' + startX + ' - startY ' + startY);
    ctx.lineTo(x, y);
    console.log('width ' + width + ' - height ' + height);
    ctx.lineTo(startX, y);

    ctx.closePath();
    ctx.stroke();

    prevWidth = width;
    prevHeight = height;
    this.zindex = i++;
}

function triangleMouseUp(e) {
    if (!isDown) {
        return;
    }
    e.preventDefault();
    e.stopPropagation();
    isDown = false;
    prevWidth = 0;
    prevHeight = 0;
}

function triangleMouseOut(e) {
    if (!isDown) {
        return;
    }
    e.preventDefault();
    e.stopPropagation();
    isDown = false;
    prevWidth = 0;
    prevHeight = 0;
}

function lineMouseDown(e, canvasOffset, offsetX, offsetY) {
    console.log('offsetX = ' + offsetX + ' - offsetY = ' + offsetY);
    e.preventDefault();
    e.stopPropagation();
    // save the starting x/y of the rectangle
    startX = parseInt((e.clientX + scrollx) - offsetX);
    startY = parseInt((e.clientY + scrolly) - offsetY);
    console.log('start height = ' + startY + ' - start wudth = ' + startX);
    // set a flag indicating the drag has begun
    isDown = true;
}

function lineMouseMove(e, ctrcanvasOffset, offsetX, offsetY) {
    if (!isDown) {
        return;
    }
}

function lineMouseUp(e, offsetX, offsetY) {
    if (!isDown) {
        return;
    }
    e.preventDefault();
    e.stopPropagation();
    e.preventDefault();
    e.stopPropagation();
    ctx.strokeStyle = clr
    ctx.lineWidth = wth;
    x = parseInt((e.clientX + scrollx) - offsetX);
    y = parseInt((e.clientY + scrolly) - offsetY);
    //ctx.globalCompositeOperation = 'destination-over';
    ctx.moveTo(startX, startY);
    ctx.lineTo(x, y);
    ctx.stroke();
    isDown = false;
}

function lineMouseOut(e) {
    if (!isDown) {
        return;
    }
    e.preventDefault();
    e.stopPropagation();
    isDown = false;
    prevWidth = 0;
    prevHeight = 0;
}

function arrowLineMouseDown(e, offsetX, offsetY) {
    console.log('offsetX = ' + offsetX + ' - offsetY = ' + offsetY);
    e.preventDefault();
    e.stopPropagation();
    // save the starting x/y of the rectangle
    startX = parseInt((e.clientX + scrollx) - offsetX);
    startY = parseInt((e.clientY + scrolly) - offsetY);
    console.log('start height = ' + startY + ' - start width = ' + startX);
    // set a flag indicating the drag has begun
    isDown = true;
}

function arrowLineMouseMove(e) {
    if (!isDown) {
        return;
    }
    e.preventDefault();
    e.stopPropagation();
}

function arrowLineMouseUp(e, offsetX, offsetY,aLength,aWidth,arrowStart,arrowEnd) {
    if (!isDown) {
        return;
    }
    e.preventDefault();
    e.stopPropagation();
    ctx.strokeStyle = clr
    ctx.lineWidth = wth;
    x = parseInt((e.clientX + scrollx) - offsetX);
    y = parseInt((e.clientY + scrolly) - offsetY);
    //ctx.globalCompositeOperation = 'destination-over';
    var dx = x - startX;
    var dy = y - startY;
    var angle = Math.atan2(dy, dx);
    var length = Math.sqrt(dx * dx + dy * dy);
    ctx.translate(startX, startY);
    ctx.rotate(angle);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(length, 0);
    if (arrowStart) {
        ctx.moveTo(aLength, -aWidth);
        ctx.lineTo(0, 0);
        ctx.lineTo(aLength, aWidth);
    }
    if (arrowEnd) {
        ctx.moveTo(length - aLength, -aWidth);
        ctx.lineTo(length, 0);
        ctx.lineTo(length - aLength, aWidth);
    }

    ctx.stroke();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    isDown = false;
}

function arrowLineMouseOut(e) {
    if (!isDown) {
        return;
    }
    e.preventDefault();
    e.stopPropagation();
    isDown = false;
    prevWidth = 0;
    prevHeight = 0;
}
function setScale(pHeight, pWidth) {
    //alert('setscale');
    var heightOriginal = canvas[0].height;
    var widthOriginal = canvas[0].width;
    // current scale (original 1 to 1)
    var verticalRatio = 1;
    var horizontalRatio = 1;
    // remove previous scale
    ctx.scale(1 / horizontalRatio, 1 / verticalRatio);

    // fill to window height while maintaining aspect ratio
    //var heightNew = $('#body').height(); //window.innerHeight;
    var heightNew = pHeight - 130; //window.innerHeight;
    // not needed if you don't care about aspect ratio
    var widthNew = pWidth - 20; //heightNew / heightOriginal * widthOriginal;

    // these would be the same if maintaining aspect ratio
    verticalRatio = heightNew / heightOriginal;
    horizontalRatio = widthNew / widthOriginal;

    // update drawing scale
    ctx.scale(horizontalRatio, verticalRatio);
}

function resizeWhiteBoard(pHeight, pWidth, pDiv) {
    alert('resize pageHeight = '+ pHeight + ' - pageWidth = '+pWidth);
     // Set up temporary canvas
    var tempCanvas = document.createElement('canvas');
    tempCanvas.width = canvas[0].width;
    tempCanvas.height = canvas[0].height;
    tmpCtx = tempCanvas.getContext('2d');

    // Copy current image to temporary canvas
    tmpCtx.drawImage(canvas[0], 0, 0);

    // Resize original canvas
    canvas[0].width = (pWidth-20);
    canvas[0].height = (pHeight - 130);

    //Scale and draw canvas eq selected size window size
    ctx = canvas[0].getContext('2d');
    ctx.scale(1, 1);
    ctx.drawImage(tempCanvas, 0, 0, tempCanvas.width, tempCanvas.height, 0, 18, canvas[0].width, canvas[0].height);

    //Reset whiteboard to canvas size
    alert('parent ' + pDiv);
    $("#"+pDiv).css({"width": pWidth + "px", "height": pHeight + "px"}); 
}

function loadImage(e) {
    var reader = new FileReader();
    reader.onload = function (event) {
        img = new Image();
        img.onload = function () {
            // Resize original canvas
            $('.board-col').css("width", this.width+2);
            $('.board-col').css("height", this.height+45);
            canvas[0].width = (this.width);
            canvas[0].height = (this.height);
            ctx.drawImage(img, 0, 0);
        }
        img.src = event.target.result;
    }
    reader.readAsDataURL(e.target.files[0]);
    $('#fileName').css('display', '');
    $('#fileName').val(($('input[type=file]').val()).split('\\').pop());
    return false;
}

function downloadFiles() {
    if ($('#fileName').val() != "") {
        downloadLnk.download = $('#fileName').val();
    }
    else {
       downloadLnk.download = ($('input[type=file]').val()).split('\\').pop();
        //downloadLnk.download = "NewFile.png"
    }
    //alert('download Files');
    var dt = canvas[0].toDataURL();
   // alert('download Files '+dt);
    this.href = dt;
}

function saveAs(uri, filename) {

    var link = document.createElement('a');
    //alert('save as' +uri);

    if (typeof link.download === 'string') {

        link.href = uri;
        link.download = filename;

        //Firefox requires the link to be in the body
        document.body.appendChild(link);

        //simulate click
        link.click();

        //remove the link when done
        document.body.removeChild(link);

    } else {

        window.open(uri);

    }
}

function userColor() {
    var x = document.getElementById("selectColor").value;
    $('#selectClr').css("color", x);
    clr = x;
    type = 'source-over';
}


// Resize original canvas
//canvas[0].width = (pageWidth - 20);
//canvas[0].height = (pageHeight - 130);

/**
 * image pasting into canvas
 * 
 * @param {string} canvas_id - canvas id
 * @param {boolean} autoresize - if canvas will be resized
 */
function CLIPBOARD_CLASS(canvas_id, autoresize) {
    var _self = this;
    var canvas = document.getElementById(canvas_id);
    var ctx = document.getElementById(canvas_id).getContext("2d");

    //handlers
    document.addEventListener('paste', function (e) { _self.paste_auto(e); }, false);

    //on paste
    this.paste_auto = function (e) {
        if (e.clipboardData) {
            var items = e.clipboardData.items;
            if (!items) return;
            //access data directly
            var is_image = false;
            for (var i = 0; i < items.length; i++) {
                if (items[i].type.indexOf("image") !== -1) {
                    //image
                    var blob = items[i].getAsFile();
                    var URLObj = window.URL || window.webkitURL;
                    var source = URLObj.createObjectURL(blob);
                    this.paste_createImage(source);
                    is_image = true;
                }
            }
            if (is_image == true) {
                e.preventDefault();
            }
        }
    };
    //draw pasted image to canvas
    this.paste_createImage = function (source) {
        var pastedImage = new Image();
        pastedImage.onload = function () {
            if (autoresize == true) {
                //resize
                canvas.width = pastedImage.width;
                canvas.height = pastedImage.height;
            }
            else {
                //clear canvas
                ctx.clearRect(0, 0, canvas.width, canvas.height);
            }
            ctx.drawImage(pastedImage, 5, 5, canvas.width-10, canvas.height-60);
        };
        pastedImage.src = source;
    };
}

//UUIDv4 = function b(a) { return a ? (a ^ Math.random() * 16 >> a / 4).toString(16) : ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, b) }
//Return and display column & Notes when initiated by selection of dropdown
function displayColumns(url, url1, colid, pageHeight) {
    console.log('this is the display columns');
    var workColId = 0, setTop = 55, setRight = 50;
    $('.note').remove(), $('.col').remove(), $('.colUA').remove(), $(".dropdown-nav-content").children().remove();
    update = axios.get(url, {
    })
    update.then((response) => {
        var column = $.parseJSON(JSON.stringify(response.data)), noteCol = colNo, noteBoard = boardId;
            column.sort(function (a, b) { return a.column_Order - b.column_Order });
            noteCol++;            
        $.each(column, function (key, data) {
            if (data.master_Id == parseInt(colid)) {
                if (data.column_Order >= 900) {
                    setTop = setTop + 10;
                    setRight = setRight + -10;
                    addUACol(++boardId, ++colNo, data.column_Id, pageHeight, data.column_Description, data.column_Order, setTop, setRight);
                }
                else {
                    addCol(++boardId, ++colNo, data.column_Id, pageHeight, data.column_Description, data.column_Order);
                }
                var colValue = data.column_Id;
                axios.get(url1, {
                    })
                        .then((response) => {
                            var note = $.parseJSON(JSON.stringify(response.data));
                            note.sort(function (a, b) { return a.postit_Order - b.postit_Order});
                            $.each(note, function (key, data) {
                                if (parseInt($("#order" + ($("#bord" + noteCol).parent().attr("id").substring(4, 9))).attr("value")) >= 900) {
                                    workColId = $("#link" + ($("#bord" + noteCol).parent().attr("id").substring(4, 9))).attr("value");
                                }
                                if (data.postit_Col_Id == colValue) {  
                                    if (colValue == workColId) {
                                        newUANote(colValue, '#bord' + noteCol, ++noteId, data.postit_Id, data.postit_Desc, data.postit_Order, data.postit_Position_Left, data.postit_Position_Top);
                                    }
                                    else {
                                        if (data.postit_Closed == false) {
                                            console.log(colValue + ' - #bord' + noteCol + ' - ' + ++noteId + ' - ' + data.postit_Id + ' - ' + data.postit_Desc + ' - ' + data.postit_Order + ' - ' + data.postit_Closed + ' - ' + data.postit_Locked + ' - ' + data.postit_Position_Left + ' - ' + data.postit_Position_Top)
                                            newNote(colValue, '#bord' + noteCol, ++noteId, data.postit_Id, data.postit_Desc, data.postit_Order, data.postit_Closed, data.postit_Locked, data.postit_Position_Left, data.postit_Position_Top);
                                        }
                                    }
                                }
                            });
                            noteCol++;
                        }, (error) => {
                            console.log(error);
                        });
            /*add linkd to drop down nav bar menu to hide show columns*/
                $(".dropdown-nav-content").css('background-color','#f1f1f1')
                $(".dropdown-nav-content").append('<a class="project-add1" href="javascript:;" data-Col="bord' + boardId + '" id="hide_Col'+boardId+'">' + data.column_Description + '</a>');
                $('a[id^="hide_Col'+boardId+'"]').on('click', function (event) {
                    $('#body').children('#' + $(this).attr('data-Col')).toggleClass("hide");
                    $('#hide_Col' + (($(this).attr('data-Col')).substring(4, 9))).toggleClass("hideColor");
                }); 
            }
        });
        update = true;
    }, (error) => {
            console.log(error);
    });
}
function reorderNotes(postColId, id, ev, noteFrom) {
    /*Update Column Id on Note dragged to new column - Force update prior to re-ordering notes on columns dragged from & Dragged to*/
    var updateString = '[{"op": "add","path": "/postit_Col_Id","value": ' + postColId + ' }]';
    update = axios.patch('https://localhost:44382/api/notes/' + id,
            JSON.parse(updateString)
        )
        update.then((response) => {
            console.log(response);
            update = true;
            /*if Column Id Successfully update to the dragged Note reorder the column the note was dragged from and column note dragged to*/
            if (update == true) {
                var ctr = 0;
                $('#' + noteFrom).children('div.note').each(function () {
                    ctr++;
                    var noteid = $(this).attr('id').substring(4, 9);
                    var fromId = $('#link' + noteid).val();
                    var updateStringFrom = '[{"op": "add","path": "/postit_order","value": ' + ctr + ' }]';
                    axios.patch('https://localhost:44382/api/notes/' + fromId,
                        JSON.parse(updateStringFrom)
                    )
                    .then((response) => {
                        console.log(response);
                    }, (error) => {
                        console.log(error);
                    });
                });
                /*Reorder Column Note dragged to*/
                var ctr1 = 0;
                $('#' + ev.target.closest('div.scrollbar').id.substring(0, 9)).children('div.note').each(function () {
                    ctr1++;
                    var noteid = $(this).attr('id').substring(4, 9);
                    var toId = $('#link' + noteid).val();
                    var updateStringTo = '[{"op": "add","path": "/postit_order","value": ' + ctr1 + ' }]';
                    axios.patch('https://localhost:44382/api/notes/' + toId,
                        JSON.parse(updateStringTo)
                    )
                    .then((response) => {
                        console.log(response);
                    }, (error) => {
                        console.log(error);
                    });
                });
            }
        }, (error) => {
            console.log(error);
        });
}
//Insert, Update and Delete of Columns via API
function addColumn(url, masterId, pageHeight, colOrder) {
    var colOrder = (($('#body').children('div.col') + 1).length).toString();
    console.log('db update of colOrder ' + colOrder);
    axios.post(url, {
        Column_Description: '',
        Master_Id: masterId,
        Column_Order: colOrder
    })
        .then((response) => {
            var id = JSON.parse(JSON.stringify(response.data));
            addCol(++boardId, ++colNo, id.column_Id, pageHeight, id.column_Description, colOrder);
            /*add linkd to drop down nav bar menu to hide show columns*/
            $(".dropdown-nav-content").append('<a class="project-add1" href="javascript:;" data-Col="bord' + boardId + '" id="hide_Col' + boardId + '">Column Description</a>');
            $('a[id^="hide_Col' + boardId + '"]').on('click', function (event) {
                $('#body').children('#' + $(this).attr('data-Col')).toggleClass("hide");
                $('#hide_Col' + (($(this).attr('data-Col')).substring(4, 9))).toggleClass("hideColor");
            }); 
            console.log(response);
        }, (error) => {
            console.log(error);
        });
}

function addUAColumn(url, masterId, pageHeight, colOrder) {
    var colOrder = 899 + parseInt($('div.colUA').length) + 1; 
    console.log('add UA column ' + colOrder);
    console.log('colno '+colOrder);
    axios.post(url, {
        Column_Description: 'Work Area',
        Master_Id: masterId,
        Column_Order: colOrder
    })
        .then((response) => {
            var id = JSON.parse(JSON.stringify(response.data));
            addUACol(++boardId, ++colNo, id.column_Id, pageHeight, id.column_Description, colOrder);
            /*add linkd to drop down nav bar menu to hide show columns*/
            $(".dropdown-nav-content").append('<a class="project-add1" href="javascript:;" data-Col="bord' + boardId + '" id="hide_Col' + boardId + '">Work Area</a>');
            $('a[id^="hide_Col' + boardId + '"]').on('click', function (event) {
                $('#body').children('#' + $(this).attr('data-Col')).toggleClass("hide");
                $('#hide_Col' + (($(this).attr('data-Col')).substring(4, 9))).toggleClass("hideColor");
            }); 
            console.log(response);
        }, (error) => {
            console.log(error);
        });
}

function editColumn(url, projectId, colDesc, columnId) {
    axios.put('https://localhost:44382/api/column/' + projectId, {
        Column_Id: projectId,
        Column_Description: colDesc,
        Master_Id: $('#projectDD').val(),
        Column_Order: columnId
    })
        .then((response) => {
            console.log(response);
        }, (error) => {
            console.log(error);
        });
}

function patchCol(url, projectId, update) {
    axios.patch('https://localhost:44382/api/column/' + projectId,
        JSON.parse(update)
    )
        .then((response) => {
            console.log(response);
        }, (error) => {
            console.log(error);
        });
}

function delColumn(url, projectId) {
    axios.delete('https://localhost:44382/api/column/' + projectId, {
    })
        .then((response) => {
            console.log(response);
        }, (error) => {
            console.log(error);
        });
}

//Insert, Update and Delete of Notes via API
function addNote(url, columnId, colNo, noteId) {
    var noteNo = (($('#body').children().length) + 1).toString();
    axios.post('https://localhost:44382/api/notes/', {
        Postit_Id: 0,
        Postit_order: noteNo,
        Postit_Desc: '',
        Postit_Locked: 0,
        Postit_Closed: 0,
        Postit_Col_Id: columnId,
        Postit_Position_Left: 0,
        Postit_Position_Top: 0
    })
        .then((response) => {
            var id = JSON.parse(JSON.stringify(response.data));
            newNote(columnId, colNo, ++noteId, id.postit_Id, id.postit_Desc, id.postit_Order, id.postit_Closed, id.postit_Locked, id.postit_Position_Left, id.postit_Position_Top);
            console.log(response);
        }, (error) => {
            console.log(error);
        });
}

function addUANote(url, columnId, colNo, noteId) {
    var noteNo = (($('#body').children().length) + 1).toString();
    axios.post('https://localhost:44382/api/notes/', {
        Postit_Id: 0,
        Postit_order: noteNo,
        Postit_Desc: '',
        Postit_Locked: 0,
        Postit_Closed: 0,
        Postit_Col_Id: columnId,
        Postit_Position_Left: 0,
        Postit_Position_Top: 0
    })
        .then((response) => {
            var id = JSON.parse(JSON.stringify(response.data));
            newUANote(columnId, colNo, ++noteId, id.postit_Id, id.postit_Desc, id.postit_Order, id.postit_Closed, id.postit_Locked, id.postit_Position_Left, id.postit_Position_Top);
            console.log(response);
        }, (error) => {
            console.log(error);
        });
}

//Insert, Update and Delete of Notes via API
/*function addUANote(url, columnId, colNo, noteId) {
    var noteNo = (($('#body').children('div.note').length) + 1).toString(); 
     axios.post('https://localhost:44382/api/notes/', {
        Postit_Id: 0,
        Postit_order: noteNo,
        Postit_Desc: '',
        Postit_Locked: 0,
        Postit_Col_Id: columnId,
        Postit_Position_Left: 0,
        Postit_Position_Top: 0
    })
        .then((response) => {
            var id = JSON.parse(JSON.stringify(response.data));
            newUANote(columnId, colNo, ++noteId, id.postit_Id, id.postit_Desc, id.postit_Order, id.postit_Position_Left, id.postit_Position_Top);
            var str = $('#note' + noteId).prev().css("margin");
            var iMargin = parseInt(str.substr(0, str.indexOf('px')));
            if (iMargin == 0) {
                $('#note' + noteId).css({ "display": "inline-block", "position": "absolute", "margin": "10px 0px 0px 3px", "z-index": noteZindex++ });
            }
            else {
                iMargin = iMargin + 40;
                $('#note' + noteId).css({ "display": "inline-block", "position": "absolute", "margin": +iMargin + "px 0px 0px 3px", "z-index": noteZindex++ });
            }
        }, (error) => {
            console.log(error);
        });
}*/

function editNote(url, columnId, colNo, noteId, id, order, desc, lock, close, left, top) {
    axios.put('https://localhost:44382/api/notes/' + id, {
        Postit_Id: id,
        Postit_order: order,
        Postit_Desc: desc,
        Postit_Locked: lock,
        Postit_Closed: close,
        Postit_Col_Id: colNo,
        Postit_Position_Left: 0,
        Postit_Position_Top: 0
    })
        .then((response) => {
            console.log(response);
        }, (error) => {
            console.log(error);
        });
}

function patchNote(url, update, columnId, colNo, noteId, id, desc) {
    console.log('Note Id ' + id);
    console.log('update Details1 ' + update);

    axios.patch('https://localhost:44382/api/notes/' + id,
         JSON.parse(update)
    )
        .then((response) => {
            console.log(response);
        }, (error) => {
            console.log(error);
        });
}
function patchNote1(url, update, columnId, colNo, noteId, id, desc) {
    console.log('Note Id ' + id);
    console.log('update Details2 ' + update);

    update = axios.patch('https://localhost:44382/api/notes/' + id,
        JSON.parse(update)
    )
        update.then((response) => {
            console.log(response);
            update = 'true';
        }, (error) => {
            console.log(error);
        });
}

function delNote(url, postitId) {
    axios.delete('https://localhost:44382/api/notes/' + postitId, {
    })
        .then((response) => {
            console.log(response);
        }, (error) => {
            console.log(error);
        });
}


function myFunction(type, selectItem) {
    axios.get('https://www.itdsolutions.com.au/postit/api/process') 
        .then((response) => {
            let dropdown = $('#projectDD');
            dropdown.empty();
            $.each(response.data, function (key, entry) {
                if (entry.bup_Id == selectItem) {
                    dropdown.append($('<option selected="true"></option>').attr('value', entry.bup_Id).text(entry.bup_Desc));
                }
                else {
                    dropdown.append($('<option></option>').attr('value', entry.bup_Id).text(entry.bup_Desc));
                }
            })
            if (type == 'edit' || type == 'add') {
                $('#projectName1').val(dropdown.children('option:selected').text());
            }
            else {
                dropdown.prop('selectedIndex', 0);
                $('#projectName1').val(dropdown.children('option:selected').text());
            }
            
            //console.log(response.status);
            // console.log(response.statusText);
            //console.log(response.headers);
            //console.log(response.config);

        });
}

