const OpenBoard = (event) => {
    window.location.href = '/boards/' + 'board_' + event.target.id;
};

document.getElementById("add_board").addEventListener('click', (event) => {
    document.getElementById("board_dialog").showModal();
});

document.getElementById("cancel").addEventListener('click', (event) => {
    event.preventDefault();
    document.getElementById("board_dialog").close();
    document.getElementById("name").value = "";
    document.getElementById("description").value = "";
    document.getElementById("users").innerHTML = '';
});

document.getElementById("add_user").addEventListener('click', (event) => {
    event.preventDefault();

    let users = document.getElementById("users");
    let userInput = document.createElement("input");
    userInput.type = "text";
    userInput.className = "user-input";
    users.appendChild(userInput);
});

document.getElementById("add").addEventListener('click', (event) => {
    event.preventDefault();

    let users = document.querySelectorAll(".user-input");
    let userEmails = [];

    for (let i = 0; i < users.length; i++) {
        userEmails.push(users[i].value);
    }

    let boardData = {
        'name': document.getElementById("name").value,
        'description': document.getElementById("description").value,
        'users': userEmails
    };

    jQuery.ajax({
        url: "/add_board",
        data: JSON.stringify(boardData),
        contentType: "application/json",
        type: "POST",
        success:function(returnedData) {
            document.getElementById("board_dialog").close();
            document.getElementById("name").value = "";
            document.getElementById("description").value = "";
            document.getElementById("users").innerHTML = '';
            boardData = returnedData[0];
            let boards = document.getElementById("boards");
            let board = document.createElement("div");
            board.id = boardData['board_id'];
            board.className = "board";
            board.onclick = OpenBoard;
            let name = boardData['name'];

            if (name.length > 11) {
                name = name.substr(0, 12) + "...";
            }

            board.innerHTML = `
            <h3 id='${board.id}' class="board-name">${name}</h3>
            `;
            boards.appendChild(board);
        }
    });
});