// Payload dropdown
$('#payload-dropdown .dropdown-menu a').on('click', function(){    
    $('#payload-dropdown .dropdown-toggle').html($(this).html() + ' <span class="caret"></span>');    
})

$(document).on('click', '.dropdown-menu.dropdown-menu-form', function(e) {
  e.stopPropagation();
});

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