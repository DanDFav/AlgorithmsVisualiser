window.addEventListener("DOMContentLoaded", async () => {
  let array = generateSet();
  drawArray(array);
  actions = new nodeList(new node("start"));
  quickSort(array, 0, array.length - 1);
  actions.print(actions.head);
});

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
      //   compare.children.push(swapNode);
      actions.add(swapNode);
    }
  }

  if (array[i + 1] != array[high]) {
    const swapNode = new swap(range, i);
    swapNode.swap(array, i + 1, high);
    swapNode.pivot = true;
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
  let set = new Array(8);

  for (let i = 0; i < set.length; i++) {
    set[i] = Math.floor(Math.random() * 100);
  }
  //   let set = [10, 80, 30, 90, 40, 50];
  //   let set = [35, 85, 73, 94, 31, 73, 15, 12, 56, 20, 93, 54];
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
      square.textContent = value.toString();
      container.appendChild(square);
      count++;
    });
  }
}

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
    let action = node.action;
    // sendToMain(action);
    if (node instanceof check) {
      for (let i = 0; i < node.children.length; i++) {
        this.print(node.children[i]);
      }
    }

    this.print(node.next);
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
    const intervalId = setInterval(displaySwaps, 500);
    setTimeout(() => {
      clearInterval(intervalId);
      console.log("Stopped the interval");
    }, 10000000);
    // displaySwaps();
  }
}

function displaySwaps() {
  resetColors();
  if (!actions.drawNode) {
    return;
  }

  // If our current node is the start node, we can just skip
  let current: node | null = actions.drawNode;
  console.log(current);
  if (current.action == "start" && current.next) {
    actions.drawNode = current.next;
  } else if (current instanceof check) {
    drawArray(current.data);

    for (let i = 0; i < current.range[0]; i++) {
      highLightIndex(i, "grey");
    }

    for (let i = current.range[0]; i <= current.sorted; i++) {
      console.log(i);
      highLightIndex(i, "aqua");
    }

    highLightIndex(current.pivotIdx, "red");
    if (current.state) {
      highLightIndex(current.valueIdx, "red");
    } else {
      highLightIndex(current.valueIdx, "yellow");
    }

    for (let i = current.range[1] + 1; i < current.data.length; i++) {
      highLightIndex(i, "grey");
    }

    if (current.next) {
      actions.drawNode = current.next;
    }
  } else if (current instanceof swap) {
    drawArray(current.product);

    for (let i = 0; i < current.range[0]; i++) {
      highLightIndex(i, "grey");
    }

    for (let i = current.range[0]; i <= current.sorted; i++) {
      console.log(i);
      highLightIndex(i, "aqua");
    }

    highLightIndex(current.swappingIdx[0], "green");
    highLightIndex(current.swappingIdx[1], "green");

    for (let i = current.range[1] + 1; i < current.orginialData.length; i++) {
      highLightIndex(i, "grey");
    }

    if (current.next) {
      actions.drawNode = current.next;
    }
  }
  if (!current.next && current instanceof swap) {
    drawArray(current.product);
    for (let i = 0; i < current.product.length; i++) {
      highLightIndex(i, "aqua");
    }
  }
  if (!current.next && current instanceof check) {
    drawArray(current.data);
    for (let i = 0; i < current.data.length; i++) {
      highLightIndex(i, "aqua");
    }
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
  constructor(action: string) {
    this.action = action;
    this.next = null;
  }
}

class swap extends node {
  product: number[] = [];
  orginialData: number[] = [];
  swapping: number[] = [];
  swappingIdx: number[] = [];
  pivot: boolean = false;
  range: number[];
  sorted: number;
  constructor(range: number[], sorted: number) {
    super("swap");
    this.range = range;
    this.sorted = sorted;
  }

  swap(array: number[], a: number, b: number) {
    this.orginialData = array.slice(0);

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
  children: node[] = [];
  data: number[];
  state: boolean = false;
  range: number[];
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
    super("check");
    this.data = data;
    this.pivot = pivot;
    this.value = value;
    this.pivotIdx = pivotIdx;
    this.valueIdx = valueIdx;
    this.next = null;
    this.range = range;
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

document.addEventListener("keydown", handleKeyDown);
