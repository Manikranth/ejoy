class TemplateEditor {
    constructor(canvasId, templateData) {
        this.canvasId = canvasId;
        this.templateData = templateData || {
            version: '1.0',
            background: {
                type: 'color',
                color: '#ffffff'
            },
            elements: []
        };
        this.selectedElement = null;
        this.nextId = 1;
        this.colorPicker = null;
        
        this.initCanvas();
        this.loadTemplate();
        this.initEventListeners();
        this.updateElementsList();
    }
    
    initCanvas() {
        // Create Fabric.js canvas
        this.canvas = new fabric.Canvas(this.canvasId, {
            width: 800,
            height: 600,
            backgroundColor: '#ffffff',
            preserveObjectStacking: true
        });
        
        // Enable element selection
        this.canvas.on('selection:created', (e) => this.handleElementSelected(e.selected[0]));
        this.canvas.on('selection:updated', (e) => this.handleElementSelected(e.selected[0]));
        this.canvas.on('selection:cleared', () => this.handleSelectionCleared());
        
        // Enable element movement
        this.canvas.on('object:moving', (e) => this.updateElementPosition(e.target));
        this.canvas.on('object:modified', (e) => this.updateElementPosition(e.target));
        
        // Set canvas to be responsive
        window.addEventListener('resize', () => {
            this.resizeCanvas();
        });
        this.resizeCanvas();
    }
    
    resizeCanvas() {
        const container = document.querySelector('.canvas-container');
        const containerWidth = container.clientWidth;
        const containerHeight = container.clientHeight;
        
        // Maintain aspect ratio
        const ratio = 4/3; // Standard invitation aspect ratio
        const canvasWidth = Math.min(containerWidth - 40, 800);
        const canvasHeight = canvasWidth / ratio;
        
        this.canvas.setDimensions({
            width: canvasWidth,
            height: canvasHeight
        });
        
        this.canvas.renderAll();
    }
    
    loadTemplate() {
        if (!this.templateData) return;
        
        // Set background
        if (this.templateData.background) {
            if (this.templateData.background.type === 'color') {
                this.canvas.backgroundColor = this.templateData.background.color;
                this.canvas.renderAll();
            } else if (this.templateData.background.type === 'image') {
                fabric.Image.fromURL(this.templateData.background.src, (img) => {
                    this.canvas.setBackgroundImage(img, this.canvas.renderAll.bind(this.canvas), {
                        scaleX: this.canvas.width / img.width,
                        scaleY: this.canvas.height / img.height
                    });
                });
            }
            // For video backgrounds, we'd need to handle differently
        }
        
        // Load elements
        if (this.templateData.elements && Array.isArray(this.templateData.elements)) {
            // Find highest ID to ensure unique IDs
            let maxId = 0;
            this.templateData.elements.forEach(element => {
                if (element.id && parseInt(element.id) > maxId) {
                    maxId = parseInt(element.id);
                }
            });
            this.nextId = maxId + 1;
            
            // Add each element to canvas
            this.templateData.elements.forEach(element => {
                this.createElementFromData(element);
            });
        }
    }
    
    createElementFromData(element) {
        if (!element.id) {
            element.id = this.nextId++;
        }
        
        const canvasWidth = this.canvas.width;
        const canvasHeight = this.canvas.height;
        
        // Calculate pixel positions from percentages
        const left = (element.position.x / 100) * canvasWidth;
        const top = (element.position.y / 100) * canvasHeight;
        
        if (element.type === 'text' || element.type === 'countdown') {
            // Create a text element
            const textOptions = {
                left: left,
                top: top,
                originX: 'center',
                originY: 'center',
                fontFamily: element.style?.fontFamily || 'Poppins',
                fontSize: element.style?.fontSize || 20,
                fill: element.style?.color || '#000000',
                fontWeight: element.style?.bold ? 'bold' : 'normal',
                fontStyle: element.style?.italic ? 'italic' : 'normal',
                underline: element.style?.underline || false,
                textAlign: element.style?.textAlign || 'center',
                metadata: {
                    id: element.id,
                    type: element.type
                }
            };
            
            if (element.type === 'countdown') {
                textOptions.metadata.targetDate = element.targetDate;
                
                // Create a placeholder text for countdown
                const countdownText = 'Countdown: 100 days 10 hours 30 minutes';
                const fabricText = new fabric.Text(countdownText, textOptions);
                this.canvas.add(fabricText);
                
                // Update the actual countdown if we're displaying
                this.updateCountdown(fabricText, element.targetDate);
            } else {
                // Regular text element
                const fabricText = new fabric.IText(element.content || 'Edit this text', textOptions);
                this.canvas.add(fabricText);
            }
        } else if (element.type === 'image') {
            // Load the image
            fabric.Image.fromURL(element.src, (img) => {
                // Scale the image to fit within reasonable bounds
                let scale = 1;
                if (img.width > canvasWidth / 2) {
                    scale = (canvasWidth / 2) / img.width;
                }
                
                img.set({
                    left: left,
                    top: top,
                    originX: 'center',
                    originY: 'center',
                    scaleX: element.scale?.x || scale,
                    scaleY: element.scale?.y || scale,
                    opacity: element.style?.opacity || 1,
                    metadata: {
                        id: element.id,
                        type: 'image'
                    }
                });
                
                this.canvas.add(img);
                this.canvas.renderAll();
            });
        }
        
        this.canvas.renderAll();
    }
    
    updateCountdown(textObject, targetDateStr) {
        if (!targetDateStr) return;
        
        const updateText = () => {
            const targetDate = new Date(targetDateStr);
            const now = new Date();
            const diff = targetDate - now;
            
            if (diff <= 0) {
                textObject.set('text', "It's time!");
                this.canvas.renderAll();
                return;
            }
            
            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diff % (1000 * 60)) / 1000);
            
            textObject.set('text', `${days} days ${hours} hours ${minutes} minutes ${seconds} seconds`);
            this.canvas.renderAll();
        };
        
        // Update immediately
        updateText();
        
        // Then update every second
        setInterval(updateText, 1000);
    }
    
    addTextElement() {
        const text = new fabric.IText('Edit this text', {
            left: this.canvas.width / 2,
            top: this.canvas.height / 2,
            originX: 'center',
            originY: 'center',
            fontFamily: 'Poppins',
            fontSize: 20,
            fill: '#000000',
            metadata: {
                id: this.nextId++,
                type: 'text'
            }
        });
        
        this.canvas.add(text);
        this.canvas.setActiveObject(text);
        this.canvas.renderAll();
        
        this.updateElementsList();
    }
    
    addImageElement(imageUrl) {
        if (!imageUrl) {
            // Open image upload modal
            const imageUploadModal = new bootstrap.Modal(document.getElementById('imageUploadModal'));
            imageUploadModal.show();
            return;
        }
        
        fabric.Image.fromURL(imageUrl, (img) => {
            // Scale the image to fit within reasonable bounds
            let scale = 1;
            if (img.width > this.canvas.width / 2) {
                scale = (this.canvas.width / 2) / img.width;
            }
            
            img.set({
                left: this.canvas.width / 2,
                top: this.canvas.height / 2,
                originX: 'center',
                originY: 'center',
                scaleX: scale,
                scaleY: scale,
                metadata: {
                    id: this.nextId++,
                    type: 'image'
                }
            });
            
            this.canvas.add(img);
            this.canvas.setActiveObject(img);
            this.canvas.renderAll();
            
            this.updateElementsList();
        });
    }
    
    addCountdownElement() {
        // Default to 100 days from now for the countdown
        const targetDate = new Date();
        targetDate.setDate(targetDate.getDate() + 100);
        const targetDateISOString = targetDate.toISOString();
        
        const text = new fabric.Text('Countdown: Loading...', {
            left: this.canvas.width / 2,
            top: this.canvas.height / 2,
            originX: 'center',
            originY: 'center',
            fontFamily: 'Poppins',
            fontSize: 20,
            fill: '#000000',
            selectable: true,
            metadata: {
                id: this.nextId++,
                type: 'countdown',
                targetDate: targetDateISOString
            }
        });
        
        this.canvas.add(text);
        this.canvas.setActiveObject(text);
        this.updateCountdown(text, targetDateISOString);
        
        this.updateElementsList();
    }
    
    removeSelectedElement() {
        if (!this.selectedElement) return;
        
        this.canvas.remove(this.selectedElement);
        this.handleSelectionCleared();
        this.updateElementsList();
    }
    
    handleElementSelected(object) {
        this.selectedElement = object;
        
        // Hide all property panels first
        document.getElementById('noSelectionMessage').classList.add('d-none');
        document.getElementById('textProperties').classList.add('d-none');
        document.getElementById('imageProperties').classList.add('d-none');
        document.getElementById('countdownProperties').classList.add('d-none');
        
        if (object.type === 'i-text' || object.type === 'text') {
            // Show text properties panel
            document.getElementById('textProperties').classList.remove('d-none');
            
            // Update text property controls with current values
            document.getElementById('textContent').value = object.text;
            document.getElementById('fontFamily').value = object.fontFamily;
            document.getElementById('fontSize').value = object.fontSize;
            document.getElementById('fontSizeValue').textContent = `${object.fontSize}px`;
            
            // Update style buttons
            document.getElementById('textBold').classList.toggle('active', object.fontWeight === 'bold');
            document.getElementById('textItalic').classList.toggle('active', object.fontStyle === 'italic');
            document.getElementById('textUnderline').classList.toggle('active', object.underline);
            
            // Update alignment buttons
            document.getElementById('alignLeft').classList.toggle('active', object.textAlign === 'left');
            document.getElementById('alignCenter').classList.toggle('active', object.textAlign === 'center');
            document.getElementById('alignRight').classList.toggle('active', object.textAlign === 'right');
            
            // Update color picker
            if (this.colorPicker) {
                this.colorPicker.setColor(object.fill);
            }
            
            // If this is a countdown, show countdown properties
            if (object.metadata && object.metadata.type === 'countdown') {
                document.getElementById('countdownProperties').classList.remove('d-none');
                
                // Set the date picker value
                if (object.metadata.targetDate) {
                    const date = new Date(object.metadata.targetDate);
                    const localDateStr = date.toISOString().split('T')[0]; // Format as YYYY-MM-DD
                    document.getElementById('countdownDate').value = localDateStr;
                }
            }
        } else if (object.type === 'image') {
            // Show image properties panel
            document.getElementById('imageProperties').classList.remove('d-none');
            
            // Update image property controls
            document.getElementById('imageOpacity').value = object.opacity * 100;
            document.getElementById('opacityValue').textContent = `${Math.round(object.opacity * 100)}%`;
        }
        
        // Highlight the element in the list
        const elements = document.querySelectorAll('.element-list-item');
        elements.forEach(el => {
            el.classList.remove('active');
            if (el.dataset.id === object.metadata.id.toString()) {
                el.classList.add('active');
            }
        });
    }
    
    handleSelectionCleared() {
        this.selectedElement = null;
        
        // Show the "no selection" message
        document.getElementById('noSelectionMessage').classList.remove('d-none');
        document.getElementById('textProperties').classList.add('d-none');
        document.getElementById('imageProperties').classList.add('d-none');
        document.getElementById('countdownProperties').classList.add('d-none');
        
        // Remove highlighting from element list
        const elements = document.querySelectorAll('.element-list-item');
        elements.forEach(el => el.classList.remove('active'));
    }
    
    updateElementPosition(object) {
        // Update the element list if needed
    }
    
    updateElementsList() {
        const elementsList = document.getElementById('elementsList');
        elementsList.innerHTML = ''; // Clear the list
        
        // Get all objects from canvas
        const objects = this.canvas.getObjects();
        
        objects.forEach(obj => {
            if (!obj.metadata) return;
            
            const li = document.createElement('li');
            li.className = 'element-list-item';
            li.dataset.id = obj.metadata.id;
            
            if (this.selectedElement && this.selectedElement.metadata.id === obj.metadata.id) {
                li.classList.add('active');
            }
            
            let iconClass = 'fas fa-question';
            let elementName = 'Unknown Element';
            
            if (obj.metadata.type === 'text') {
                iconClass = 'fas fa-font';
                elementName = obj.text.substring(0, 15) + (obj.text.length > 15 ? '...' : '');
            } else if (obj.metadata.type === 'image') {
                iconClass = 'fas fa-image';
                elementName = 'Image';
            } else if (obj.metadata.type === 'countdown') {
                iconClass = 'fas fa-hourglass-half';
                elementName = 'Countdown';
            }
            
            li.innerHTML = `
                <i class="${iconClass}"></i>
                <span>${elementName}</span>
                <button class="btn btn-sm btn-link text-danger element-delete-btn">
                    <i class="fas fa-trash-alt"></i>
                </button>
            `;
            
            li.addEventListener('click', (e) => {
                if (e.target.closest('.element-delete-btn')) {
                    // Delete button was clicked
                    const objToRemove = this.canvas.getObjects().find(o => o.metadata && o.metadata.id.toString() === li.dataset.id);
                    if (objToRemove) {
                        this.canvas.remove(objToRemove);
                        this.handleSelectionCleared();
                        this.updateElementsList();
                    }
                } else {
                    // List item was clicked
                    const objToSelect = this.canvas.getObjects().find(o => o.metadata && o.metadata.id.toString() === li.dataset.id);
                    if (objToSelect) {
                        this.canvas.setActiveObject(objToSelect);
                        this.canvas.renderAll();
                    }
                }
            });
            
            elementsList.appendChild(li);
        });
    }
    
    initEventListeners() {
        // Add element buttons
        document.getElementById('addTextBtn').addEventListener('click', () => this.addTextElement());
        document.getElementById('addImageBtn').addEventListener('click', () => this.addImageElement());
        document.getElementById('addCountdownBtn').addEventListener('click', () => this.addCountdownElement());
        
        // Initialize color picker for text
        this.colorPicker = Pickr.create({
            el: '#textColorPicker',
            theme: 'classic',
            default: '#000000',
            swatches: [
                '#000000', '#FFFFFF', '#333333', '#666666', '#999999',
                '#ff6900', '#fcb900', '#7bdcb5', '#00d084', '#8ed1fc',
                '#0693e3', '#eb144c', '#f78da7', '#9900ef'
            ],
            components: {
                preview: true,
                opacity: true,
                hue: true,
                interaction: {
                    input: true,
                    clear: true,
                    save: true
                }
            }
        });
        
        this.colorPicker.on('save', (color) => {
            if (this.selectedElement && (this.selectedElement.type === 'i-text' || this.selectedElement.type === 'text')) {
                this.selectedElement.set('fill', color.toHEXA().toString());
                this.canvas.renderAll();
            }
            this.colorPicker.hide();
        });
        
        // Image upload preview
        document.getElementById('imageFile').addEventListener('change', (e) => {
            if (e.target.files && e.target.files[0]) {
                const reader = new FileReader();
                
                reader.onload = function(e) {
                    document.getElementById('uploadPreview').classList.remove('d-none');
                    document.getElementById('uploadPreviewImage').src = e.target.result;
                };
                
                reader.readAsDataURL(e.target.files[0]);
            }
        });
        
        document.getElementById('uploadImageBtn').addEventListener('click', () => {
            const formData = new FormData(document.getElementById('imageUploadForm'));
            
            fetch('/editor/upload-image', {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    this.addImageElement(data.url);
                    bootstrap.Modal.getInstance(document.getElementById('imageUploadModal')).hide();
                    
                    // Reset form
                    document.getElementById('imageUploadForm').reset();
                    document.getElementById('uploadPreview').classList.add('d-none');
                } else {
                    alert('Error uploading image: ' + data.error);
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert('An error occurred while uploading the image.');
            });
        });
        
        // Text property controls
        document.getElementById('textContent').addEventListener('input', (e) => {
            if (this.selectedElement && (this.selectedElement.type === 'i-text' || this.selectedElement.type === 'text')) {
                this.selectedElement.set('text', e.target.value);
                this.canvas.renderAll();
                this.updateElementsList();
            }
        });
        
        document.getElementById('fontFamily').addEventListener('change', (e) => {
            if (this.selectedElement && (this.selectedElement.type === 'i-text' || this.selectedElement.type === 'text')) {
                this.selectedElement.set('fontFamily', e.target.value);
                this.canvas.renderAll();
            }
        });
        
        document.getElementById('fontSize').addEventListener('input', (e) => {
            if (this.selectedElement && (this.selectedElement.type === 'i-text' || this.selectedElement.type === 'text')) {
                const fontSize = parseInt(e.target.value);
                document.getElementById('fontSizeValue').textContent = `${fontSize}px`;
                this.selectedElement.set('fontSize', fontSize);
                this.canvas.renderAll();
            }
        });
        
        document.getElementById('textBold').addEventListener('click', () => {
            if (this.selectedElement && (this.selectedElement.type === 'i-text' || this.selectedElement.type === 'text')) {
                const isBold = this.selectedElement.fontWeight === 'bold';
                this.selectedElement.set('fontWeight', isBold ? 'normal' : 'bold');
                document.getElementById('textBold').classList.toggle('active');
                this.canvas.renderAll();
            }
        });
        
        document.getElementById('textItalic').addEventListener('click', () => {
            if (this.selectedElement && (this.selectedElement.type === 'i-text' || this.selectedElement.type === 'text')) {
                const isItalic = this.selectedElement.fontStyle === 'italic';
                this.selectedElement.set('fontStyle', isItalic ? 'normal' : 'italic');
                document.getElementById('textItalic').classList.toggle('active');
                this.canvas.renderAll();
            }
        });
        
        document.getElementById('textUnderline').addEventListener('click', () => {
            if (this.selectedElement && (this.selectedElement.type === 'i-text' || this.selectedElement.type === 'text')) {
                const isUnderlined = this.selectedElement.underline;
                this.selectedElement.set('underline', !isUnderlined);
                document.getElementById('textUnderline').classList.toggle('active');
                this.canvas.renderAll();
            }
        });
        
        document.getElementById('alignLeft').addEventListener('click', () => {
            if (this.selectedElement && (this.selectedElement.type === 'i-text' || this.selectedElement.type === 'text')) {
                this.selectedElement.set('textAlign', 'left');
                
                document.getElementById('alignLeft').classList.add('active');
                document.getElementById('alignCenter').classList.remove('active');
                document.getElementById('alignRight').classList.remove('active');
                
                this.canvas.renderAll();
            }
        });
        
        document.getElementById('alignCenter').addEventListener('click', () => {
            if (this.selectedElement && (this.selectedElement.type === 'i-text' || this.selectedElement.type === 'text')) {
                this.selectedElement.set('textAlign', 'center');
                
                document.getElementById('alignLeft').classList.remove('active');
                document.getElementById('alignCenter').classList.add('active');
                document.getElementById('alignRight').classList.remove('active');
                
                this.canvas.renderAll();
            }
        });
        
        document.getElementById('alignRight').addEventListener('click', () => {
            if (this.selectedElement && (this.selectedElement.type === 'i-text' || this.selectedElement.type === 'text')) {
                this.selectedElement.set('textAlign', 'right');
                
                document.getElementById('alignLeft').classList.remove('active');
                document.getElementById('alignCenter').classList.remove('active');
                document.getElementById('alignRight').classList.add('active');
                
                this.canvas.renderAll();
            }
        });
        
        // Image properties
        document.getElementById('imageOpacity').addEventListener('input', (e) => {
            if (this.selectedElement && this.selectedElement.type === 'image') {
                const opacity = parseInt(e.target.value) / 100;
                document.getElementById('opacityValue').textContent = `${Math.round(opacity * 100)}%`;
                this.selectedElement.set('opacity', opacity);
                this.canvas.renderAll();
            }
        });
        
        // Countdown properties
        document.getElementById('countdownDate').addEventListener('change', (e) => {
            if (this.selectedElement && this.selectedElement.metadata && this.selectedElement.metadata.type === 'countdown') {
                const targetDate = new Date(e.target.value);
                targetDate.setHours(0, 0, 0, 0);
                
                this.selectedElement.metadata.targetDate = targetDate.toISOString();
                this.updateCountdown(this.selectedElement, targetDate.toISOString());
            }
        });
    }
    
    getTemplateData() {
        // Extract template data from canvas
        const elements = this.canvas.getObjects().map(obj => {
            if (!obj.metadata) return null;
            
            // Base element structure
            const element = {
                id: obj.metadata.id,
                type: obj.metadata.type,
                position: {
                    x: Math.round((obj.left / this.canvas.width) * 100),
                    y: Math.round((obj.top / this.canvas.height) * 100)
                }
            };
            
            // Element-specific properties
            if (obj.type === 'i-text' || obj.type === 'text') {
                element.type = obj.metadata.type === 'countdown' ? 'countdown' : 'text';
                element.content = obj.text;
                element.style = {
                    fontFamily: obj.fontFamily,
                    fontSize: obj.fontSize,
                    color: obj.fill,
                    bold: obj.fontWeight === 'bold',
                    italic: obj.fontStyle === 'italic',
                    underline: obj.underline,
                    textAlign: obj.textAlign
                };
                
                if (element.type === 'countdown') {
                    element.targetDate = obj.metadata.targetDate;
                }
            } else if (obj.type === 'image') {
                element.type = 'image';
                element.src = obj.getSrc();
                element.scale = {
                    x: obj.scaleX,
                    y: obj.scaleY
                };
                element.style = {
                    opacity: obj.opacity
                };
            }
            
            return element;
        }).filter(Boolean); // Remove nulls
        
        // Get background
        const background = {
            type: 'color',
            color: this.canvas.backgroundColor
        };
        
        if (this.canvas.backgroundImage) {
            background.type = 'image';
            background.src = this.canvas.backgroundImage.getSrc();
        }
        
        return {
            version: this.templateData.version || '1.0',
            background: background,
            elements: elements
        };
    }
} 