function showCircularProgress() {
    var the = $('#circularProgress');
    if (!the.length) {
        the = $('<div>').attr('id', 'circularProgress').appendTo(document.body);
        var cp = $('<div>').attr('id', 'cpBody').appendTo(the);
        for (var i=1; i<=8; i++)
            cp.append($('<div>').attr('id', 'cp'+i).addClass('cp'));
    }
    the.show();
}
function hideCircularProgress() {
    $('#circularProgress').hide();
}

function copyToClipboard(text) {
    var $temp = $("<input>");
    $("body").append($temp);
    $temp.val(text).select();
    document.execCommand("copy");
    $temp.remove();
}

function updatePrevNextExamples(){
	if(window.prev_example_url != ''){
		$('#prev_example').unbind().bind('click', function(){
			window.location = window.prev_example_url;
		})
	}else{
		$('#prev_example').hide();
	}
	
	if(window.next_example_url != ''){
		$('#next_example').unbind().bind('click', function(){
			window.location = window.next_example_url;
		})
	}else{
		$('#next_example').hide();
	}
}

function flashInputBackgroundColor(e) {
    e.css('background-color', 'red').focus();
    setTimeout(function () {e.css('background-color', '');},200);
}
