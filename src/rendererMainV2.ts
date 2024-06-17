window.addEventListener("DOMContentLoaded", async () => {
  drawArray(array);
  actions = new nodeList(new node("start", []));
  quickSort(array, 0, array.length - 1);
  actions.print(actions.head);
});

let array = generateSet();
let actions: nodeList;

function quickSort(array: number[], low: number, high: number): void {
  if (low < high) {
    const pivotIndex = partitionFunc(array, low, high);

    quickSort(array, low, pivotIndex - 1);
    quickSort(array, pivotIndex + 1, high);
  }
}

function partitionFunc(array: number[], low: number, high: number): number {
  const pivot = array[high];
  let i = low - 1;

  let range = [low, high];

  for (let j = low; j < high; j++) {
    const compare = new check(
      array.slice(0),
      pivot,
      array[j],
      high,
      j,
      range,
      i
    );
    actions.add(compare);
    if (compare.compare()) {
      i++;
      const swapNode = new swap(range, i);
      swapNode.swap(array, i, j);
      actions.add(swapNode);
    }
  }

  if (array[i + 1] != array[high]) {
    const swapNode = new swap(range, i);
    swapNode.swap(array, i + 1, high);
    actions.add(swapNode);
  }

  return i + 1;
}

function swapFunc(array: number[], a: number, b: number): void {
  const temp = array[a];
  array[a] = array[b];
  array[b] = temp;
}

function generateSet() {
  let set = new Array(150);

  for (let i = 0; i < set.length; i++) {
    set[i] = Math.floor(Math.random() * 99 + 1);
  }
  return set;
}

function drawArray(arr: number[]): void {
  const container = document.getElementById("container");
  if (container) {
    container.innerHTML = "";
    let count = 0;
    arr.forEach((value) => {
      const square = document.createElement("div");
      const name = "square " + count;
      const id = "index";
      square.className = name;
      square.id = id;
      square.style.height = `${value * 3}px`;
      container.appendChild(square);
      count++;
    });
  }
}

function sendToMain(action: string) {
  window.ipcRenderer.send("output", {
    action,
  });
}

function resetColors() {
  const squares = document.getElementsByClassName("square");
  for (let i = 0; i < squares.length; i++) {
    (squares[i] as HTMLElement).style.backgroundColor = "white";
  }
}

function handleKeyDown(event: KeyboardEvent): void {
  if (event.key == " ") {
    const intervalId = setInterval(displaySwapsRainbow, 20);
    setTimeout(() => {
      clearInterval(intervalId);
    }, 10000000);
    //displaySwaps();

    //displaySwapsRainbow();
  }
}

function displaySwaps() {
  if (!actions.drawNode) {
    return;
  }

  // If our current node is the start node, we can just skip
  let current: node | null = actions.drawNode;
  if (current.action == "start" && current.next) {
    actions.drawNode = current.next;
  } else if (current instanceof check) {
    drawArray(current.originalData);

    for (let i = 0; i < current.originalData.length; i++) {
      if (i < current.range[0]) {
        highLightIndex(i, "grey");
      }

      if (i >= current.range[0] && i <= current.sorted) {
        highLightIndex(i, "lightgreen");
      }

      if (i == current.pivotIdx) {
        highLightIndex(i, "red");
        positionRedLine(current.pivotIdx); // Position the red line
      }

      if (i == current.valueIdx) {
        if (current.state) {
          highLightIndex(i, "red");
        } else {
          highLightIndex(i, "yellow");
        }
      }

      if (i >= current.range[1] + 1) {
        highLightIndex(i, "grey");
      }
    }
    if (current.next) {
      actions.drawNode = current.next;
    }
  } else if (current instanceof swap) {
    drawArray(current.product);

    for (let i = 0; i < current.originalData.length; i++) {
      if (i < current.range[0]) {
        highLightIndex(i, "grey");
      }

      if (i >= current.range[0] && i <= current.sorted) {
        highLightIndex(i, "lightgreen");
      }

      if (i == current.swappingIdx[0] || i == current.swappingIdx[1]) {
        highLightIndex(current.swappingIdx[0], "red");
        highLightIndex(current.swappingIdx[1], "red");
      }

      if (i > current.range[1]) {
        highLightIndex(i, "grey");
      }
    }
    if (current.next) {
      actions.drawNode = current.next;
    }
  }

  if (!current.next && current instanceof swap) {
    drawArray(current.product);
    for (let i = 0; i < current.product.length; i++) {
      highLightIndex(i, "lightgreen");
    }
  }
  if (!current.next && current instanceof check) {
    drawArray(current.originalData);
    for (let i = 0; i < current.originalData.length; i++) {
      highLightIndex(i, "lightgreen");
    }
  }
}

function displayRainbow(index: number, data: number[]) {
  // Ensure the number is within the range 1-100
  let number = data[index];
  // Map the number to a hue value between 300 (violet) and 0 (red)
  const hue = 300 - ((number - 1) * 300) / 99;
  const name = "square " + index;
  const square = document.getElementsByClassName(name)[0] as HTMLElement;
  square.style.backgroundColor = `hsl(${hue}, 100%, 50%)`;
}

function displaySwapsRainbow() {
  if (!actions.drawNode) {
    return;
  }

  // If our current node is the start node, we can just skip
  let current: node | null = actions.drawNode;

  if (current.action == "start" && current.next) {
    actions.drawNode = current.next;
  } else if (current instanceof check) {
    drawArray(current.originalData);
    positionRedLine(current.pivotIdx); // Position the red line
    for (let i = 0; i < current.originalData.length; i++) {
      displayRainbow(i, current.originalData);
    }
    if (current.next) {
      actions.drawNode = current.next;
    }
  } else if (current instanceof swap) {
    drawArray(current.product);

    for (let i = 0; i < current.originalData.length; i++) {
      displayRainbow(i, current.originalData);
    }

    if (current.next) {
      actions.drawNode = current.next;
    }
  }
}

function positionRedLine(index: number) {
  const square = document.getElementsByClassName(
    "square " + index
  )[0] as HTMLElement;
  if (square) {
    const redLine = document.getElementById("red-line") as HTMLElement;
    const topPosition = square.offsetTop;
    redLine.style.top = `${topPosition}px`;
    redLine.style.opacity = "0.5";
  }
}

function highLightIndex(value: number, colour: string) {
  const name = "square " + value;
  const square = document.getElementsByClassName(name)[0] as HTMLElement;
  square.style.backgroundColor = colour;
}

class node {
  action: string;
  next: node | null;
  originalData: number[] = [];
  range: number[];
  constructor(action: string, range: number[]) {
    this.action = action;
    this.next = null;
    this.range = range;
  }
}

class swap extends node {
  product: number[] = [];
  swapping: number[] = [];
  swappingIdx: number[] = [];
  sorted: number;
  constructor(range: number[], sorted: number) {
    super("swap", range);
    this.sorted = sorted;
  }

  swap(array: number[], a: number, b: number) {
    this.originalData = array.slice(0);

    this.swapping.push(array[a]);
    this.swapping.push(array[b]);
    this.swappingIdx.push(a);
    this.swappingIdx.push(b);

    const temp = array[a];
    array[a] = array[b];
    array[b] = temp;
    this.product = array.slice(0);
  }
}

class check extends node {
  pivot: number;
  value: number;
  pivotIdx: number;
  valueIdx: number;
  next: swap | null;
  state: boolean = false;
  sorted: number;
  constructor(
    data: number[],
    pivot: number,
    value: number,
    pivotIdx: number,
    valueIdx: number,
    range: number[],
    sorted: number
  ) {
    super("check", range);
    this.originalData = data;
    this.pivot = pivot;
    this.value = value;
    this.pivotIdx = pivotIdx;
    this.valueIdx = valueIdx;
    this.next = null;
    this.sorted = sorted;
  }

  compare(): boolean {
    if (this.value < this.pivot) {
      this.state = true;
      return true;
    }
    return false;
  }
}

class partition {}

class nodeList {
  head: node;
  current: node;
  drawNode: node;
  constructor(head: node) {
    this.head = head;
    this.current = head;
    this.drawNode = head;
  }

  add(node: node) {
    this.current.next = node;
    this.current = this.current.next;
  }

  print(node: node | null) {
    if (!node) {
      return;
    }
    console.log(node);
    this.print(node.next);
  }
}

document.addEventListener("keydown", handleKeyDown);
