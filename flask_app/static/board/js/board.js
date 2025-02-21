let selectedListId = null;
let selectedCard = null;
let originList = null;
let offsetX = null;
let offsetY = null;
let editingCard = null;
var socket;

const boardsIndex = window.location.href.indexOf("/boards");
socket = io.connect(window.location.href.substring(0, boardsIndex));

const OnEdit = (event) => {
    const id = event.target.id;
    const cardId = event.target.parentElement.id;

    if (document.getElementById(id).textContent === "Edit") {
        document.getElementById(cardId + "_name").removeAttribute('readonly');
        document.getElementById(cardId + "_descr").removeAttribute('readonly');
        document.getElementById(id).textContent = "Save";
        editingCard = document.getElementById(cardId);
    } else {
        document.getElementById(cardId + "_name").setAttribute('readonly', true);
        document.getElementById(cardId + "_descr").setAttribute('readonly', true);
        document.getElementById(id).textContent = "Edit";

        // Post updated information to database here.
        socket.emit('change_card_info', {
            'card_id': cardId.substring(0, cardId.indexOf("_card")),
            'name': document.getElementById(cardId + "_name").value,
            'description': document.getElementById(cardId + "_descr").value
        });

        editingCard = null;
    }
};

const OnDelete = (event) => {
    socket.emit('delete_card', {
        'card_id': event.target.parentElement.id.substring(0, event.target.parentElement.id.indexOf("_card"))
    });
};

const OnAddCard = (event) => {
    document.getElementById("card_dialog").showModal();
    selectedListId = event.target.parentElement.id;
};

document.getElementById("cancel").addEventListener('click', (event) => {
    event.preventDefault();
    selectedListId = null;
    document.getElementById("name").value = "";
    document.getElementById("descr").value = "";
    document.getElementById("card_dialog").close();
});

document.getElementById("add_card").addEventListener('click', (event) => {
    event.preventDefault();
    document.getElementById("card_dialog").close();

    const cardData = {
        'list_id': selectedListId,
        'name': document.getElementById("name").value,
        'description': document.getElementById("descr").value
    };

    document.getElementById("name").value = "";
    document.getElementById("descr").value = "";

    socket.emit('add_card', cardData);
});

document.addEventListener('mousedown', (event) => {
    const selectedClass = event.target.className;
    const selectedParentClass = event.target.parentElement.className;

    console.log("Selected Class: " + selectedClass);
    console.log("Selected Parent Class: " + selectedParentClass);

    if ((selectedClass === "card") && (event.target.className !== "edit") && (event.target.className !== "delete")) {
        selectedCard = event.target;
    } else if ((selectedParentClass === "card") && (event.target.className !== "edit") && (event.target.className !== "delete")) {
        selectedCard = event.target.parentElement;
    }

    if ((selectedCard) && (!document.getElementById(selectedCard.id + "_name").hasAttribute("readonly"))) {
        selectedCard = null;
        return;
    }

    if (selectedCard) {
        originList = selectedCard.parentElement;
        const rect = selectedCard.getBoundingClientRect();
        offsetX = event.clientX - rect.left;
        offsetY = event.clientY - rect.top;
        selectedCard.style.position = "fixed";
        selectedCard.style.left = (event.clientX - offsetX) + "px";
        selectedCard.style.top = (event.clientY - offsetY) + "px";
    }
});

document.addEventListener('mousemove', (event) => {
    if (selectedCard) {
        selectedCard.style.left = (event.clientX - offsetX) + "px";
        selectedCard.style.top = (event.clientY - offsetY) + "px";
    }
});


document.addEventListener('mouseup', (event) => {
    if (selectedCard) {
        let allLists = document.querySelectorAll('.list');
        let newList = null;
        let selectedCardRect = selectedCard.getBoundingClientRect();

        for (let i = 0; i < allLists.length; i++) {
            let list = allLists[i];
            let rect = list.getBoundingClientRect();

            if ((selectedCardRect.top >= rect.top) && (selectedCardRect.top <= rect.bottom) && (selectedCardRect.left >= rect.left) && (selectedCardRect.left <= rect.right)) {
                newList = list;
            } else if ((selectedCardRect.top >= rect.top) && (selectedCardRect.top <= rect.bottom) && (selectedCardRect.right >= rect.left) && (selectedCardRect.right <= rect.right)) {
                newList = list;
            } else if ((selectedCardRect.botton >= rect.top) && (selectedCardRect.bottom <= rect.bottom) && (selectedCardRect.left >= rect.left) && (selectedCardRect.left <= rect.right)) {
                newList = list;
            } else if ((selectedCardRect.bottom >= rect.top) && (selectedCardRect.bottom <= rect.bottom) && (selectedCardRect.right >= rect.left) && (selectedCardRect.right <= rect.right)) {
                newList = list;
            }
        }

        selectedCard.style = null;

        if (newList) {
            if (newList.id === originList.parentElement.id) {
                return;
            }

            let cardsElement = newList.querySelector('.cards');
            originList.removeChild(selectedCard);
            cardsElement.appendChild(selectedCard);

            // Post update to database here.
            socket.emit('change_list', {
                'origin_list_id': originList.id,
                'target_list_id': newList.id,
                'card_id': selectedCard.id.substring(0, selectedCard.id.indexOf("_card"))
            });
        }
    }

    selectedCard = null;
    originList = null;
    offsetX = null;
    offsetY = null;
});

document.addEventListener('keydown', (event) => {
    if (event.key !== 'Enter') {
        return null;
    }

    if (document.getElementById("input_message").value) {
        let message = document.createElement("p");
        message.className = "self-message";
        message.textContent = document.getElementById("input_message").value;
        document.getElementById("messages").appendChild(message);

        socket.emit('send_message', {
            'msg': document.getElementById("input_message").value
        });

        document.getElementById("input_message").value = "";
    }

    if (editingCard) {
        let cardId = editingCard.id;
        cardId = cardId.substring(0, cardId.indexOf("_card"));

        document.getElementById(cardId + "_card_name").setAttribute('readonly', true);
        document.getElementById(cardId + "_card_descr").setAttribute('readonly', true);
        document.getElementById(cardId + "_edit").textContent = "Edit";

        // Post updated information to database here.
        socket.emit('change_card_info', {
            'card_id': cardId,
            'name': document.getElementById(cardId + "_card_name").value,
            'description': document.getElementById(cardId + "_card_descr").value
        });

        editingCard = null;
    }
});

socket.on('connect', () => {
    socket.emit('joined', {});
});

socket.on('display_joined', function(data) {
    const msg = data.msg;
    let message = document.createElement("h6");
    message.textContent = msg;
    document.getElementById("messages").appendChild(message);
});

socket.on('display_card', (returnedData) => {
    console.log("Displaying card");
    let list = document.getElementById(returnedData['list_id'] + "_cards");
    let card = document.createElement("div");
    card.id = returnedData['card_id'] + "_card";
    card.className = "card";
    card.innerHTML = `
    <label for="${card.id}_name">Name:</label>
    <br>
    <input id="${card.id}_name" type="text" value="${returnedData['name']}" readonly/>

    <br>
    <br>

    <label for="${card.id}_descr">Description:</label>
    <br>
    <textarea id="${card.id}_descr" readonly>${returnedData['description']}</textarea>

    <br>
    <br>

    <button id="${returnedData['card_id']}_edit" class="edit" onclick="OnEdit(event)">Edit</button>
    <button id="${returnedData['card_id']}_delete" class="delete" onclick="OnDelete(event)">Delete</button>
    `;
    list.appendChild(card);
    selectedListId = null;
});

socket.on('display_list_change', (data) => {
    let card = document.getElementById(data['card_id'] + "_card");
    let targetList = document.getElementById(data['target_list_id']);
    originList = document.getElementById(data['origin_list_id']);

    // document.getElementById(originList.id).removeChild(card);
    document.getElementById(targetList.id + "_cards").appendChild(card);
});

socket.on('display_info_change', (data) => {
    document.getElementById(data['card_id'] + "_card_name").value = data['name'];
    document.getElementById(data['card_id'] + "_card_descr").value = data['description'];
});

socket.on('display_delete', (data) => {
    document.getElementById(data['card_id'] + "_card").remove();
});

socket.on('receive_message', (data) => {
    console.log("Message Received!");
    let message = document.createElement("p");
    message.className = "other-message";
    message.textContent = data['msg'];
    document.getElementById("messages").appendChild(message);
});