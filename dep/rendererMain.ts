window.addEventListener("DOMContentLoaded", async () => {
  let array = generateSet();
  quickSort(null, array, 0, array.length - 1, 0, null);
  //console.log(root);
  actions.printActions();
  actions.current = actions.head;
});

let leaves: Partition[] = [];
let root: Partition;
let actions: actionList;
let part: number = 0;

class Partition {
  parent: Partition | null;
  child: Partition[] | null;
  array: number[];
  low: number;
  high: number;
  pivot: number;
  branch: number;
  range: number[];

  constructor(
    parent: Partition | null,
    array: number[],
    low: number,
    high: number,
    branch: number
  ) {
    this.parent = parent;
    this.array = array;
    this.low = low;
    this.high = high;
    this.pivot = array[high];
    this.branch = branch;
    this.child = null;
    this.range = array.slice(low, high + 1);
  }

  partition(p_ap: actionPartition | null): [number, actionPartition] {
    let ap = new actionPartition(this, part++, p_ap);
    if (p_ap) {
      p_ap.childPart?.push(ap);
    }

    actions.buildChain(ap);
    let array = this.array;
    let high = this.high;
    let low = this.low;
    let pivot = this.pivot;
    let toSwap = low - 1;

    for (let j = low; j <= high; j++) {
      if (array[j] < pivot) {
        toSwap++;
        if (array[toSwap] != array[j]) {
          let aps = new actionSwap(this, [array[toSwap], array[j]], ap);
          actions.buildChain(aps);
          [array[toSwap], array[j]] = [array[j], array[toSwap]];
          aps.product = array.slice(low, high + 1);
        }
      }
    }
    if (array[toSwap + 1] != array[high]) {
      let aps = new actionSwap(this, [array[toSwap + 1], array[high]], ap);
      actions.buildChain(aps);
      [array[toSwap + 1], array[high]] = [array[high], array[toSwap + 1]];
      aps.product = array.slice(low, high + 1);
    }
    ap.product = array.slice(low, high + 1);
    return [toSwap + 1, ap];
  }
}

class actionList {
  head: actionNode | null;
  current: actionNode | null;

  constructor() {
    this.head = null;
    this.current = null;
  }

  buildChain(actionNode: actionNode) {
    if (this.current) {
      this.current.child = actionNode;
      //this.sendToMain();
      this.current = this.current.child;
    } else {
      console.log("Cannot Set Child: Current is null");
    }
  }

  setHead(actionNode: actionNode) {
    this.head = actionNode;
    this.current = this.head;
  }

  // sendToMain() {
  //   if (this.current instanceof actionSwap) {
  //     let type = this.current.action;
  //     let values = this.current.data;
  //     window.ipcRenderer.send("actionSwap", {
  //       type,
  //       values,
  //     });
  //   } else if (this.current instanceof actionPartition) {
  //     let type = this.current.action;
  //     let values = this.current.data;
  //     let product = this.current.product;
  //     window.ipcRenderer.send("actionPartition", {
  //       type,
  //       values,
  //       product,
  //     });
  //   } else if (this.current instanceof actionStart) {
  //     let type = this.current.action;
  //     window.ipcRenderer.send("actionStart", {
  //       type,
  //     });
  //   }
  // }

  printActions() {
    this.current = this.head;
    while (this.current) {
      //this.current = this.current.child;'
      console.log(this.current);
      this.next();
    }
  }

  next() {
    if (!this.current) {
      return;
    }

    this.current = this.current.child;
  }
}

class actionNode {
  node: Partition;
  action: string;
  child: actionNode | null;
  product: number[];
  originData: number[];

  constructor(node: Partition, action: string) {
    this.node = node;
    this.action = action;
    this.child = null;
    this.product = [];
    this.originData = node.range;
  }

  setChild(child: actionNode) {
    this.child = child;
  }
}

class actionSwap extends actionNode {
  data: number[];
  actPart: actionPartition;
  partName: number;

  constructor(node: Partition, data: number[], actPart: actionPartition) {
    let action = "Swap";
    super(node, action);
    this.data = data;
    this.actPart = actPart;
    this.partName = actPart.name;
  }
}

class actionStart extends actionNode {
  constructor(node: Partition) {
    let action = "Start";
    super(node, action);
  }
}

class actionPartition extends actionNode {
  data: number[];
  name: number;
  parentName: number | null;
  parentPart: actionPartition | null;
  childPart: actionPartition[] | null;
  constructor(
    node: Partition,
    name: number,
    parentPart: actionPartition | null
  ) {
    let action = "Partition";
    super(node, action);
    this.data = node.range;
    this.name = name;
    this.parentPart = parentPart;
    if (parentPart) {
      this.parentName = parentPart.name;
    } else {
      this.parentName = null;
    }
    this.childPart = [];
  }
}

function quickSort(
  parent: Partition | null,
  array: number[],
  low: number,
  high: number,
  branch: number,
  ap: actionPartition | null
) {
  if (low < high) {
    let node = new Partition(parent, array, low, high, branch);
    if (actions == null) {
      actions = new actionList();
      actions.setHead(new actionStart(node));
    }

    if (parent != null) {
      if (parent.child == null) {
        parent.child = [];
      }
      parent.child.push(node);
    } else {
      root = node;
    }

    let p = node.partition(ap);
    let value = p[0];
    let p_ap = p[1];
    console.log(p);

    branch += 1;
    quickSort(node, array, low, value - 1, branch, p_ap);
    quickSort(node, array, value + 1, high, branch, p_ap);
  }
}

function swap(array: number[], a: number, b: number) {
  let temp = array[a];
  array[a] = array[b];
  array[b] = temp;
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

function generateSet() {
  // let set = new Array(6);

  // for (let i = 0; i < set.length; i++) {
  //   set[i] = Math.floor(Math.random() * 100);
  // }
  // let set = [10, 80, 30, 90, 40, 50, 70];
  let set = [81, 11, 27, 64, 79, 48];
  drawArray(set);
  return set;
}

function displaySwaps() {
  console.log(swapDrawState);
  if (actions.current instanceof actionSwap) {
    const currentNode: actionSwap = actions.current;
    if (swapDrawState == 0) {
      if (actions.current) {
        updateTextBox(actions.current?.action);
      }
    }

    if (swapDrawState == 2) {
      actions.next();
      swapDrawState = 0;
    } else {
      highLightSquares(currentNode);
    }
  } else if (actions.current instanceof actionPartition) {
    const currentNode: actionPartition = actions.current;

    updateTextBox(currentNode.action);

    actions.next();
    drawArray(currentNode.node.range);
  } else {
    actions.next();
  }
}

function resetColors() {
  const squares = document.getElementsByClassName("square");
  for (let i = 0; i < squares.length; i++) {
    (squares[i] as HTMLElement).style.backgroundColor = "white";
  }
}

let swapDrawState = 0;

function highLightSquares(currentNode: actionSwap) {
  let colour = "red";
  if (swapDrawState == 1) {
    colour = "green";
    if (actions.current) {
      drawArray(actions.current?.product);
    }
  }
  const one: number = currentNode.data[0];
  const two: number = currentNode.data[1];
  const arr: number[] = currentNode.node.range;

  const oneIdx = arr.indexOf(one);
  const twoIdx = arr.indexOf(two);

  const nameOne = "square " + oneIdx;
  const nameTwo = "square " + twoIdx;

  const squareOne = document.getElementsByClassName(nameOne)[0] as HTMLElement;
  const squareTwo = document.getElementsByClassName(nameTwo)[0] as HTMLElement;

  if (squareOne) {
    squareOne.style.backgroundColor = colour;
  }

  if (squareTwo) {
    squareTwo.style.backgroundColor = colour;
  }

  swapDrawState++;
}

function handleKeyDown(event: KeyboardEvent): void {
  if (event.key == " ") {
    resetColors();
    displaySwaps();
  }
}

function updateTextBox(message: string) {
  const textBox = document.getElementById("textBox");
  if (textBox) {
    const newMessage = document.createElement("div");
    newMessage.textContent = message;
    textBox.appendChild(newMessage);
    textBox.scrollTop = textBox.scrollHeight; // Scroll to the bottom
  }
}

document.addEventListener("keydown", handleKeyDown);
