class SortingVisualizer {
    constructor() {
        this.array = [];
        this.isSorting = false;
        this.isPaused = false;
        this.delay = 50;
        this.setupDOM();
        this.setupAudio();
        this.setupEventListeners();
        this.generateNewArray();
        this.updateAlgorithmInfo();

        this.stopBtn.disabled = true;
        this.pauseBtn.disabled = true;
    }

    setupDOM() {
        this.container = document.querySelector('.visualization');
        this.sizeInput = document.getElementById('array-size');
        this.speedInput = document.getElementById('speed');
        this.algorithmSelect = document.getElementById('algorithm');
        this.generateBtn = document.getElementById('generate');
        this.sortBtn = document.getElementById('sort');
        this.pauseBtn = document.getElementById('pause');
        this.stopBtn = document.getElementById('stop');
    }

    setupAudio() {
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        this.masterGain = this.audioContext.createGain();
        this.masterGain.connect(this.audioContext.destination);
        this.masterGain.gain.value = 0.1;
    }

    playSound(frequency) {
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.masterGain);
        
        oscillator.type = 'sine';
        oscillator.frequency.value = frequency;
        
        gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.1);
        
        oscillator.start();
        oscillator.stop(this.audioContext.currentTime + 0.1);
    }

    playCompletionSound() {
        const frequencies = [523.25, 659.25, 783.99, 1046.50];
        frequencies.forEach((freq, index) => {
            setTimeout(() => this.playSound(freq), index * 100);
        });
    }

    generateNewArray() {
        const size = parseInt(this.sizeInput.value);
        this.array = Array(size).fill(0).map(() => Math.random() * 100);
        this.updateVisualization();
    }

    updateVisualization(comparing = [], sorted = [], processing = []) {
        this.container.innerHTML = '';
        const maxVal = Math.max(...this.array);
        
        this.array.forEach((val, idx) => {
            const bar = document.createElement('div');
            bar.className = 'bar';
            bar.style.height = `${(val / maxVal) * 100}%`;
            
            if (comparing.includes(idx)) {
                bar.classList.add('comparing');
            } else if (sorted.includes(idx)) {
                bar.classList.add('sorted');
            } else if (processing.includes(idx)) {
                bar.classList.add('processing');
            }
            
            this.container.appendChild(bar);
        });
    }

    async sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    togglePause() {
        if (!this.isSorting) return;
        this.isPaused = !this.isPaused;
        this.pauseBtn.textContent = this.isPaused ? 'Resume' : 'Pause';
    }

    async waitIfPaused() {
        while (this.isPaused && this.isSorting) {
            await this.sleep(100);
        }
    }

    markArrayAsSorted() {
        this.updateVisualization([], [...Array(this.array.length).keys()], []);
    }

    async bubbleSort() {
        const n = this.array.length;
        for (let i = 0; i < n - 1; i++) {
            for (let j = 0; j < n - i - 1; j++) {
                if (!this.isSorting) return;
                await this.waitIfPaused();
                
                if (this.array[j] > this.array[j + 1]) {
                    [this.array[j], this.array[j + 1]] = [this.array[j + 1], this.array[j]];
                    this.playSound(200 + this.array[j] * 5);
                }
                this.updateVisualization([j, j + 1], [...Array(n - i).keys()].map(x => x + i), []);
                await this.sleep(this.delay);
            }
        }
    }

    async insertionSort() {
        const n = this.array.length;
        for (let i = 1; i < n; i++) {
            let key = this.array[i];
            let j = i - 1;
            
            while (j >= 0 && this.array[j] > key) {
                if (!this.isSorting) return;
                await this.waitIfPaused();
                
                this.array[j + 1] = this.array[j];
                this.playSound(200 + this.array[j] * 5);
                this.updateVisualization([j, j + 1], [...Array(i).keys()], []);
                await this.sleep(this.delay);
                j--;
            }
            this.array[j + 1] = key;
        }
    }

    async selectionSort() {
        const n = this.array.length;
        for (let i = 0; i < n - 1; i++) {
            let minIdx = i;
            
            for (let j = i + 1; j < n; j++) {
                if (!this.isSorting) return;
                await this.waitIfPaused();
                
                if (this.array[j] < this.array[minIdx]) {
                    minIdx = j;
                }
                this.updateVisualization([i, j], [...Array(i).keys()], []);
                await this.sleep(this.delay);
            }
            
            if (minIdx !== i) {
                [this.array[i], this.array[minIdx]] = [this.array[minIdx], this.array[i]];
                this.playSound(200 + this.array[i] * 5);
            }
        }
    }

    async quickSort(low, high) {
        if (low < high && this.isSorting) {
            let pivot = await this.partition(low, high);
            await this.quickSort(low, pivot - 1);
            await this.quickSort(pivot + 1, high);
        }
    }

    async partition(low, high) {
        const pivot = this.array[high];
        let i = low - 1;
        
        for (let j = low; j < high; j++) {
            if (!this.isSorting) return i + 1;
            await this.waitIfPaused();
            
            if (this.array[j] < pivot) {
                i++;
                [this.array[i], this.array[j]] = [this.array[j], this.array[i]];
                this.playSound(200 + this.array[i] * 5);
            }
            this.updateVisualization([i, j, high], [], [low, high]);
            await this.sleep(this.delay);
        }
        
        [this.array[i + 1], this.array[high]] = [this.array[high], this.array[i + 1]];
        return i + 1;
    }

    async mergeSort(left, right) {
        if (left < right && this.isSorting) {
            const mid = Math.floor((left + right) / 2);
            await this.mergeSort(left, mid);
            await this.mergeSort(mid + 1, right);
            await this.merge(left, mid, right);
        }
    }

    async merge(left, mid, right) {
        const n1 = mid - left + 1;
        const n2 = right - mid;
        const L = this.array.slice(left, mid + 1);
        const R = this.array.slice(mid + 1, right + 1);
        
        let i = 0, j = 0, k = left;
        
        while (i < n1 && j < n2) {
            if (!this.isSorting) return;
            await this.waitIfPaused();
            
            if (L[i] <= R[j]) {
                this.array[k] = L[i];
                i++;
            } else {
                this.array[k] = R[j];
                j++;
            }
            this.playSound(200 + this.array[k] * 5);
            this.updateVisualization([k], [], [left, mid, right]);
            await this.sleep(this.delay);
            k++;
        }
        
        while (i < n1) {
            if (!this.isSorting) return;
            await this.waitIfPaused();
            this.array[k] = L[i];
            this.updateVisualization([k], [], [left, mid, right]);
            await this.sleep(this.delay);
            i++;
            k++;
        }
        
        while (j < n2) {
            if (!this.isSorting) return;
            await this.waitIfPaused();
            this.array[k] = R[j];
            this.updateVisualization([k], [], [left, mid, right]);
            await this.sleep(this.delay);
            j++;
            k++;
        }
    }

    updateAlgorithmInfo() {
        const algoInfo = {
            bubble: {
                name: 'Bubble Sort',
                description: 'Repeatedly steps through the list, compares adjacent elements and swaps them if they are in the wrong order.',
                bestCase: 'O(n)',
                avgCase: 'O(n²)',
                worstCase: 'O(n²)',
                space: 'O(1)',
                stable: 'Yes',
                adaptive: 'Yes'
            },
            insertion: {
                name: 'Insertion Sort',
                description: 'Iterates through the list, removes one element at a time, and inserts it into the correct position in the sorted part of the list.',
                bestCase: 'O(n)',
                avgCase: 'O(n²)',
                worstCase: 'O(n²)',
                space: 'O(1)',
                stable: 'Yes',
                adaptive: 'Yes'
            },
            selection: {
                name: 'Selection Sort',
                description: 'Repeatedly finds the minimum element from the unsorted part and swaps it with the first element of the unsorted part.',
                bestCase: 'O(n²)',
                avgCase: 'O(n²)',
                worstCase: 'O(n²)',
                space: 'O(1)',
                stable: 'No',
                adaptive: 'No'
            },
            quick: {
                name: 'Quick Sort',
                description: 'Selects a pivot element from the list, and partitions the other elements into two sub-lists, according to whether they are less than or greater than the pivot.',
                bestCase: 'O(n log n)',
                avgCase: 'O(n log n)',
                worstCase: 'O(n²)',
                space: 'O(log n)',
                stable: 'No',
                adaptive: 'Yes'
            },
            merge: {
                name: 'Merge Sort',
                description: 'Divides the input list into two halves, calls itself for the two halves, and then merges the two sorted halves.',
                bestCase: 'O(n log n)',
                avgCase: 'O(n log n)',
                worstCase: 'O(n log n)',
                space: 'O(n)',
                stable: 'Yes',
                adaptive: 'No'
            }
        };

        const selectedAlgo = this.algorithmSelect.value;
        const info = algoInfo[selectedAlgo];

        document.getElementById('algo-name').textContent = info.name;
        document.getElementById('algo-description').textContent = info.description;
        document.getElementById('best-case').textContent = info.bestCase;
        document.getElementById('avg-case').textContent = info.avgCase;
        document.getElementById('worst-case').textContent = info.worstCase;
        document.getElementById('space-complexity').textContent = info.space;
        document.getElementById('stability').textContent = info.stable;
        document.getElementById('adaptivity').textContent = info.adaptive;
    }

    setupEventListeners() {
        this.generateBtn.addEventListener('click', () => this.generateNewArray());
        this.sortBtn.addEventListener('click', () => this.startSorting());
        this.pauseBtn.addEventListener('click', () => this.togglePause());
        this.stopBtn.addEventListener('click', () => this.stopSorting());
        this.sizeInput.addEventListener('input', () => this.generateNewArray());
        this.speedInput.addEventListener('input', () => {
            this.delay = 101 - this.speedInput.value;
        });
        this.algorithmSelect.addEventListener('change', () => this.updateAlgorithmInfo());
    }

    stopSorting() {
        this.isSorting = false;
        this.isPaused = false;
        this.generateNewArray();
        this.sortBtn.disabled = false;
        this.generateBtn.disabled = false;
        this.stopBtn.disabled = true;
        this.pauseBtn.disabled = true;
        this.pauseBtn.textContent = 'Pause';
    }

    async startSorting() {
        if (this.isSorting) return;
        this.isSorting = true;
        this.isPaused = false;
        this.sortBtn.disabled = true;
        this.generateBtn.disabled = true;
        this.stopBtn.disabled = false;
        this.pauseBtn.disabled = false;

        switch (this.algorithmSelect.value) {
            case 'bubble': await this.bubbleSort(); break;
            case 'insertion': await this.insertionSort(); break;
            case 'selection': await this.selectionSort(); break;
            case 'quick': await this.quickSort(0, this.array.length - 1); break;
            case 'merge': await this.mergeSort(0, this.array.length - 1); break;
        }

        if (this.isSorting) {
            this.isSorting = false;
            this.sortBtn.disabled = false;
            this.generateBtn.disabled = false;
            this.stopBtn.disabled = true;
            this.pauseBtn.disabled = true;
            this.markArrayAsSorted();
            this.playCompletionSound();
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new SortingVisualizer();
});