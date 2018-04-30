// Find the "Delete bird" button
var deleteButton = document.querySelectorAll('.delete-button');

// when the user clicks the "Delete bird" button, create message to say "are you sure"
deleteButton.forEach(function(button){

    button.addEventListener('click', function(ev){

        // show the confirm message
        var okToDelete = confirm("Delete bird - Are you sure?");

        // if user presses cancel, this will prevent form from submitting
        if (!okToDelete) {
            ev.preventDefault(); // prevent the click event from happening
        }
    })
});