// Payload dropdown
$('#payload-dropdown .dropdown-menu a').on('click', function(){    
    $('#payload-dropdown .dropdown-toggle').html($(this).html() + ' <span class="caret"></span>');    
})

$(document).on('click', '.dropdown-menu.dropdown-menu-form', function(e) {
  e.stopPropagation();
});

var top_container = document.getElementById('top-container');
var sub_container = document.getElementById('sub-container');
var sidebar_right = document.getElementById('sidebar-right');
var sidebar_left = document.getElementById('sidebar-left');

console.log(top_container.width);

function onClickDiscover()
{
}

function onClickPing()
{
}

function onClickGet()
{
}

function onClickPost()
{
}

function onClickPut()
{
}

function onClickDelete()
{
}

function onClickObserve()
{
}

function onClickCoap()
{
}

function clearInputText(id)
{
	var inputText = document.getElementById(id);
	inputText.value="";
}