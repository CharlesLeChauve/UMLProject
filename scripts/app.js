
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


class UMLBlock {
    constructor(name) {
        this.name = name; // Nom de la classe
        this.Attributes = []; // Liste des attributs
        this.Methods = []; // Liste des méthodes 
    }

    // Ajouter un attribut
	addAttribute(attribute, visibility = "private") {
		this.Attributes.push({attribute, visibility});
		this.Attributes.sort((a, b) => {
			if (a.visibility < b.visibility) {
				return -1;
			} else if (a.visibility > b.visibility) {
				return 1;
			} else {
				return 0;
			}
		});
	}

    // Ajouter une méthode
    addMethod(method, visibility = "public") {
        this.Methods.push({method, visibility});
		this.Methods.sort((a, b) => {
			if (a.visibility < b.visibility) {
				return -1;
			} else if (a.visibility > b.visibility) {
				return 1;
			} else {
				return 0;
			}
		});
    }
}

// **Création de l'instance personBlock**
const personBlock = new UMLBlock("Person");

// Ajouter des attributs
personBlock.addAttribute("name: string");
personBlock.addAttribute("age: number");
personBlock.addAttribute("sex: int", "private");

// Ajouter des méthodes
personBlock.addMethod("getName(): string");
personBlock.addMethod("calculateAge(): number", "private");


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
displayToolbar();

// Fonction pour afficher la toolbar
function displayToolbar() {
    // Effacer la toolbar si besoin (dans ce cas, au chargement c'est vide)
	const toolbarDiv = document.getElementById("toolbar");
    toolbarDiv.innerHTML = '';

    const title = document.createElement('h2');
    title.textContent = "Barre d'outils";
    toolbarDiv.appendChild(title);

    const createBlockButton = document.createElement('button');
    createBlockButton.textContent = "Create Block";
    createBlockButton.addEventListener('click', () => {
        // Créer un nouveau bloc
        const newBlock = new UMLBlock("NewClass");

        const defaultX = 100;
        const defaultY = 100;
        const defaultWidth = 200;
        const blockHeight = drawBlockFromUMLBlock(newBlock, defaultX, defaultY, defaultWidth);

        blocks.push({ umlBlock: newBlock, x: defaultX, y: defaultY, width: defaultWidth, height: blockHeight });
		selectedBlock = newBlock;
		displayBlockDetails();
        redrawCanvas();
    });

	const deleteBlockButton = document.createElement('button');
    deleteBlockButton.textContent = "Delete Block";
    deleteBlockButton.addEventListener('click', () => {
        // Créer un nouveau bloc
		if (selectedBlock != null) {
			blocks.pop(selectedBlock);
			selectedBlock = null;
			displayBlockDetails();
		}

        redrawCanvas();
    });

	const generateCodeButton = document.createElement('button');
	generateCodeButton.textContent = "Generate Code";
	generateCodeButton.addEventListener('click', () => {
		if (!selectedBlock)
			return;
		const newWindow = window.open(
			'',
			'secondaryWindow', // Nom de la fenêtre (utilisé pour éviter d'ouvrir plusieurs fenêtres identiques)
			'width=600,height=400,scrollbars=yes,resizable=yes' // Options de la fenêtre
		);
	
		// Vérifie si la fenêtre a bien été ouverte
		if (newWindow) {
			newWindow.document.title = "Fenêtre secondaire";
			newWindow.document.body.innerHTML = classBasicTemplate(selectedBlock);
		} else {
			alert("La fenêtre pop-up a été bloquée par votre navigateur !");
		}

		if (selectedBlock != null) {
			blocks.pop(selectedBlock);
			selectedBlock = null;
			displayBlockDetails();
		}

        redrawCanvas();
    });

    toolbarDiv.appendChild(createBlockButton);
    toolbarDiv.appendChild(deleteBlockButton);
    toolbarDiv.appendChild(generateCodeButton);

}


function drawBlockFromUMLBlock(umlBlock, x, y, width) {
    const padding = 10 * scale;
    const lineHeight = 20 * scale;

    const blockWidth = width * scale;

    // Calculer la hauteur totale requise
    const totalLines =
        1 + // Titre
        1 + // Ligne de séparation
        umlBlock.Attributes.length +
        1 + // Ligne de séparation
        umlBlock.Methods.length;

    const blockHeight = lineHeight * totalLines;

    // Appeler la fonction qui dessine le contenu du bloc
    drawBlockContent(umlBlock, x * scale, y * scale, blockWidth, blockHeight, padding, lineHeight);

    // Retourner la hauteur calculée pour un éventuel usage ultérieur
    return blockHeight / scale; // Retourner la hauteur originale
}


function createEditableSection(form, titleText, items, addItemCallback, umlBlock) {
    const sectionTitle = document.createElement('h4');
    sectionTitle.textContent = titleText;
    form.appendChild(sectionTitle);

    const list = document.createElement('ul');
    items.forEach((item, index) => {
        const listItem = document.createElement('li');

        // Sélecteur pour la visibilité
        const visibilitySelect = document.createElement('select');
        const publicOption = document.createElement('option');
        publicOption.value = 'public';
        publicOption.textContent = 'Public';
        const privateOption = document.createElement('option');
        privateOption.value = 'private';
        privateOption.textContent = 'Private';

        visibilitySelect.appendChild(publicOption);
        visibilitySelect.appendChild(privateOption);
        visibilitySelect.value = item.visibility;
        visibilitySelect.addEventListener('change', () => {
            item.visibility = visibilitySelect.value;
            redrawCanvas();
        });

        // Champ d'entrée pour l'attribut ou la méthode
        const input = document.createElement('input');
        input.type = 'text';
        input.value = item.attribute || item.method;
        input.addEventListener('input', () => {
            if (item.attribute !== undefined) {
                item.attribute = input.value;
            } else {
                item.method = input.value;
            }
            redrawCanvas();
        });

        // Bouton pour supprimer l'élément
        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Delete';
        deleteButton.type = 'button';
        deleteButton.addEventListener('click', () => {
            items.splice(index, 1);
            displayBlockDetails(); // Rafraîchit le formulaire
            redrawCanvas();
        });

        listItem.appendChild(visibilitySelect);
        listItem.appendChild(input);
        listItem.appendChild(deleteButton);
        list.appendChild(listItem);
    });
    form.appendChild(list);

    // Champ pour ajouter un nouvel élément
    const addInput = document.createElement('input');
    addInput.type = 'text';
    addInput.placeholder = 'Add new item';

    // Sélecteur pour la visibilité du nouvel élément
    const addVisibilitySelect = document.createElement('select');
    const addPublicOption = document.createElement('option');
    addPublicOption.value = 'public';
    addPublicOption.textContent = 'Public';
    const addPrivateOption = document.createElement('option');
    addPrivateOption.value = 'private';
    addPrivateOption.textContent = 'Private';

    addVisibilitySelect.appendChild(addPublicOption);
    addVisibilitySelect.appendChild(addPrivateOption);

    const addButton = document.createElement('button');
    addButton.textContent = 'Add';
    addButton.type = 'button';
    addButton.addEventListener('click', () => {
        if (addInput.value.trim() !== '') {
            const visibility = addVisibilitySelect.value;
            addItemCallback(addInput.value.trim(), visibility);
            addInput.value = '';
            displayBlockDetails(); // Rafraîchit le formulaire
            redrawCanvas();
        }
    });

    form.appendChild(addVisibilitySelect);
    form.appendChild(addInput);
    form.appendChild(addButton);
    form.appendChild(document.createElement('br'));
}

function displayBlockDetails() {
    // Efface le contenu précédent du workspace
	workspace.innerHTML = '';
	const umlBlock = selectedBlock;
	if (!selectedBlock)
			return;

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
    createEditableSection(form, 'Attributes:', umlBlock.Attributes, (value, visibility) => {
        umlBlock.addAttribute(value, visibility);
    }, umlBlock);

    createEditableSection(form, 'Methods:', umlBlock.Methods, (value, visibility) => {
        umlBlock.addMethod(value, visibility);
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
    let textY = y + lineHeight + padding * 2;

    textY += padding;

    // Afficher les attributs
    umlBlock.Attributes.forEach(attr => {
        const visibilitySymbol = attr.visibility === 'public' ? '+ ' : '- ';
        ctx.fillText(`${visibilitySymbol}${attr.attribute}`, x + padding, textY);
        textY += lineHeight;
    });

    // Dessiner une ligne de séparation avant les méthodes
    ctx.beginPath();
    ctx.moveTo(x, textY - padding);
    ctx.lineTo(x + blockWidth, textY - padding);
    ctx.stroke();

    textY += padding;

    // Afficher les méthodes
    umlBlock.Methods.forEach(meth => {
        const visibilitySymbol = meth.visibility === 'public' ? '+ ' : '- ';
        ctx.fillText(`${visibilitySymbol}${meth.method}`, x + padding, textY);
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

function generateCodeFromBlock(umlBlock) {

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
			selectedBlock = block.umlBlock;
            displayBlockDetails();
            break;
        }
    }
});


//template functions
function classBasicTemplate(umlBlock) {
	let text = `
class ${umlBlock.name} {
public:
    ${umlBlock.name}();
    ~${umlBlock.name}();
};
`;

	return text;
}

