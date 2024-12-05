
// Variables globales
const blockDetails = document.getElementById("block-details");
const canvas = document.getElementById("diagram-canvas");
const ctx = canvas.getContext("2d");
// Variables globales
const workspace = document.getElementById("workspace");
const blocks = [];

let selectedBlock = null;
let offsetX = 0;
let offsetY = 0;
let scale = 1;

// // Ajuste la taille du canvas
// canvas.width = 600;
// canvas.height = 400;



class UMLBlock {
    constructor(name) {
        this.name = name; // Nom de la classe
        this.publicAttributes = []; // Liste des attributs publics
        this.privateAttributes = []; // Liste des attributs privés
        this.publicMethods = []; // Liste des méthodes publiques
        this.privateMethods = []; // Liste des méthodes privées
    }

    // Ajouter un attribut public
    addPublicAttribute(attribute) {
        this.publicAttributes.push(attribute);
    }

    // Ajouter un attribut privé
    addPrivateAttribute(attribute) {
        this.privateAttributes.push(attribute);
    }

    // Ajouter une méthode publique
    addPublicMethod(method) {
        this.publicMethods.push(method);
    }

    // Ajouter une méthode privée
    addPrivateMethod(method) {
        this.privateMethods.push(method);
    }
}

// **Création de l'instance personBlock**
const personBlock = new UMLBlock("Person");

// Ajouter des attributs
personBlock.addPublicAttribute("name: string");
personBlock.addPrivateAttribute("age: number");

// Ajouter des méthodes
personBlock.addPublicMethod("getName(): string");
personBlock.addPrivateMethod("calculateAge(): number");


// Dessin initial
const blockHeight = drawBlockFromUMLBlock(personBlock, 50, 50, 200);
blocks.push({ umlBlock: personBlock, x: 50, y: 50, width: 200, height: blockHeight });


//Declarations :
function resizeCanvas() {
	const containerWidth = canvas.clientWidth;
    const containerHeight = canvas.clientHeight;
	
    // Tenir compte de la densité de pixels
    const dpr = window.devicePixelRatio || 1;
    canvas.width = containerWidth * dpr;
    canvas.height = containerHeight * dpr;
	
    // Ajuster la taille de rendu en CSS
    canvas.style.width = containerWidth + 'px';
    canvas.style.height = containerHeight + 'px';
	
    // Réinitialiser les transformations du contexte
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(dpr * scale, dpr * scale);
	
    // Redessiner le canvas
    redrawCanvas();
}

resizeCanvas();
window.addEventListener('resize', resizeCanvas);


function drawBlockFromUMLBlock(umlBlock, x, y, width) {
    const padding = 10 * scale;
    const lineHeight = 20 * scale;

    const blockWidth = width * scale;

    // Calculer la hauteur totale requise
    const totalLines =
        1 + // Titre
        1 + // Ligne de séparation
        umlBlock.publicAttributes.length +
        umlBlock.privateAttributes.length +
        1 + // Ligne de séparation
        umlBlock.publicMethods.length +
        umlBlock.privateMethods.length;

    const blockHeight = lineHeight * totalLines + padding * 2;

    // Appeler la fonction qui dessine le contenu du bloc
    drawBlockContent(umlBlock, x * scale, y * scale, blockWidth, blockHeight, padding, lineHeight);

    // Retourner la hauteur calculée pour un éventuel usage ultérieur
    return blockHeight / scale; // Retourner la hauteur originale
}


// Fonction pour créer des sections éditables
function createEditableSection(form, titleText, items, addItemCallback, umlBlock) {
	const sectionTitle = document.createElement('h4');
	sectionTitle.textContent = titleText;
	form.appendChild(sectionTitle);

	const list = document.createElement('ul');
	items.forEach((item, index) => {
		const listItem = document.createElement('li');

		const input = document.createElement('input');
		input.type = 'text';
		input.value = item;
		input.addEventListener('input', () => {
			items[index] = input.value;
			redrawCanvas();
		});

		// Bouton pour supprimer l'élément
		const deleteButton = document.createElement('button');
		deleteButton.textContent = 'Delete';
		deleteButton.type = 'button';
		deleteButton.addEventListener('click', () => {
			items.splice(index, 1);
			displayBlockDetails(umlBlock); // Rafraîchit le formulaire
			redrawCanvas();
		});

		listItem.appendChild(input);
		listItem.appendChild(deleteButton);
		list.appendChild(listItem);
	});
	form.appendChild(list);

	// Champ pour ajouter un nouvel élément
	const addInput = document.createElement('input');
	addInput.type = 'text';
	addInput.placeholder = 'Add new item';
	const addButton = document.createElement('button');
	addButton.textContent = 'Add';
	addButton.type = 'button';
	addButton.addEventListener('click', () => {
		if (addInput.value.trim() !== '') {
			addItemCallback(addInput.value.trim());
			addInput.value = '';
			displayBlockDetails(umlBlock); // Rafraîchit le formulaire
			redrawCanvas();
		}
	});

	form.appendChild(addInput);
	form.appendChild(addButton);
	form.appendChild(document.createElement('br'));
}


function displayBlockDetails(umlBlock) {
    // Efface le contenu précédent du workspace
    workspace.innerHTML = '';

    // Créer un formulaire
    const form = document.createElement('form');

    // Champ pour le nom de la classe
    const classNameLabel = document.createElement('label');
    classNameLabel.textContent = 'Class Name:';
    const classNameInput = document.createElement('input');
    classNameInput.type = 'text';
    classNameInput.value = umlBlock.name;
    classNameInput.addEventListener('input', () => {
        umlBlock.name = classNameInput.value;
        redrawCanvas();
    });
    form.appendChild(classNameLabel);
    form.appendChild(classNameInput);
    form.appendChild(document.createElement('br'));

    // Sections pour les attributs et les méthodes
    createEditableSection(form, 'Public Attributes:', umlBlock.publicAttributes, (value) => {
        umlBlock.addPublicAttribute(value);
    }, umlBlock);

    createEditableSection(form, 'Private Attributes:', umlBlock.privateAttributes, (value) => {
        umlBlock.addPrivateAttribute(value);
    }, umlBlock);

    createEditableSection(form, 'Public Methods:', umlBlock.publicMethods, (value) => {
        umlBlock.addPublicMethod(value);
    }, umlBlock);

    createEditableSection(form, 'Private Methods:', umlBlock.privateMethods, (value) => {
        umlBlock.addPrivateMethod(value);
    }, umlBlock);

    // Ajouter le formulaire au workspace
    workspace.appendChild(form);
}


function drawBlockContent(umlBlock, x, y, blockWidth, blockHeight, padding, lineHeight) {
    // Dessiner le fond et le contour du bloc
    ctx.fillStyle = "#ddd";
    ctx.fillRect(x, y, blockWidth, blockHeight);
    ctx.strokeStyle = "#000";
    ctx.strokeRect(x, y, blockWidth, blockHeight);

    // Dessiner le titre de la classe
    ctx.fillStyle = "#000";
    ctx.font = `bold ${16 * scale}px Arial`;
    ctx.fillText(umlBlock.name, x + padding, y + lineHeight);

    // Dessiner une ligne de séparation après le titre
    ctx.beginPath();
    ctx.moveTo(x, y + lineHeight + padding);
    ctx.lineTo(x + blockWidth, y + lineHeight + padding);
    ctx.stroke();

    // Initialiser la position verticale pour le texte
    ctx.font = `${14 * scale}px Arial`;
    let textY = 5 + y + lineHeight + padding * 2;

    // Afficher les attributs publics
    umlBlock.publicAttributes.forEach(attr => {
        ctx.fillText(`+ ${attr}`, x + padding, textY);
        textY += lineHeight;
    });

    // Afficher les attributs privés
    umlBlock.privateAttributes.forEach(attr => {
        ctx.fillText(`- ${attr}`, x + padding, textY);
        textY += lineHeight;
    });

    // Dessiner une ligne de séparation avant les méthodes
    ctx.beginPath();
    ctx.moveTo(x, textY - padding);
    ctx.lineTo(x + blockWidth, textY - padding);
    ctx.stroke();

	textY += 5;

    // Afficher les méthodes publiques
    umlBlock.publicMethods.forEach(meth => {
        ctx.fillText(`+ ${meth}`, x + padding, textY);
        textY += lineHeight;
    });

    // Afficher les méthodes privées
    umlBlock.privateMethods.forEach(meth => {
        ctx.fillText(`- ${meth}`, x + padding, textY);
        textY += lineHeight;
    });
}

// Fonction pour redessiner le canvas
function redrawCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Efface le canvas
    for (const block of blocks) {
        drawBlockFromUMLBlock(block.umlBlock, block.x, block.y, block.width);
    }
}


//Event Listeners :

// Events listener for drag and drop blocks
canvas.addEventListener("mousedown", (event) => {
    const mouseX = event.offsetX / scale;
    const mouseY = event.offsetY / scale;

    // Vérifie si un bloc a été cliqué
    for (const block of blocks) {
        if (
            mouseX >= block.x &&
            mouseX <= block.x + block.width &&
            mouseY >= block.y &&
            mouseY <= block.y + block.height
        ) {
            selectedBlock = block;
            offsetX = mouseX - block.x;
            offsetY = mouseY - block.y;
            break;
        }
    }
});

canvas.addEventListener("mousemove", (event) => {
    if (selectedBlock) {
        const mouseX = event.offsetX / scale;
        const mouseY = event.offsetY / scale;

        selectedBlock.x = mouseX - offsetX;
        selectedBlock.y = mouseY - offsetY;

        redrawCanvas();
    }
});

canvas.addEventListener("mouseup", () => {
    selectedBlock = null;
});

canvas.addEventListener("click", (event) => {
    const mouseX = event.offsetX / scale;
    const mouseY = event.offsetY / scale;

    // Vérifie si un bloc a été cliqué
    for (const block of blocks) {
        if (
            mouseX >= block.x &&
            mouseX <= block.x + block.width &&
            mouseY >= block.y &&
            mouseY <= block.y + block.height
        ) {
            // Afficher les détails du bloc dans le div workspace
            displayBlockDetails(block.umlBlock);
            break;
        }
    }
});


