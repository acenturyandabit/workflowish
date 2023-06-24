export type TreePath = number[];

export type FocusTaker = {
    focus: () => void
}

export type FocusTakerNode = {
    taker: FocusTaker
    children: FocusTakerNode[]
}

export class DFSFocusManager {
    focusTakerDirectory!: FocusTakerNode;
    constructor() {
        this.emptyThis();
    }

    emptyThis() {
        this.focusTakerDirectory = emptyDirectory();
    }

    childPath(currentPath: TreePath, idx: number): TreePath {
        return [...currentPath, idx];
    }

    getOrInsertNodeAt(currentPath: TreePath, nodeToInsert?: FocusTaker): FocusTakerNode {
        let currentItem = this.focusTakerDirectory;
        for (let pathIdx = 0; pathIdx < currentPath.length; pathIdx++) {
            while (currentItem.children.length < currentPath[pathIdx] + 1) {
                // need to insert a bunch of stuff
                currentItem.children.push({
                    taker: {
                        focus: () => {
                            // overridden on actual insertion
                        }
                    },
                    children: []
                })
            }
            if (pathIdx == currentPath.length - 1 && nodeToInsert) {
                currentItem.children[currentPath[pathIdx]] = {
                    taker: nodeToInsert,
                    children: currentItem.children[currentPath[pathIdx]].children
                }
            }
            currentItem = currentItem.children[currentPath[pathIdx]];
        }
        return currentItem;
    }

    getNodeOrNullAt(currentPath: TreePath): FocusTakerNode | undefined {
        let currentItem = this.focusTakerDirectory;
        for (let pathIdx = 0; pathIdx < currentPath.length; pathIdx++) {
            currentItem = currentItem.children[currentPath[pathIdx]];
            if (!currentItem) break;
        }
        return currentItem;
    }

    registerChild(currentPath: TreePath, focusTaker: FocusTaker) {
        this.getOrInsertNodeAt(currentPath, focusTaker)
    }

    focusPrev(currentPath: TreePath) {
        let nodeToFocus: FocusTakerNode | undefined;
        if (currentPath[currentPath.length - 1] > 0) {
            const previousSibling: TreePath = [...currentPath.slice(0, -1), currentPath[currentPath.length - 1] - 1];
            const lastDeepestSiblingDescendantCandidate: TreePath = previousSibling;
            // don't have to worry about iscollapsed here since we re-index the tree after each render
            // Try to get last deepest child ancestor of sibling
            let lastChildOfDescendant = (this.getNodeOrNullAt(lastDeepestSiblingDescendantCandidate)?.children.length || 0) - 1;
            while (lastChildOfDescendant > 0) {
                lastDeepestSiblingDescendantCandidate.push(lastChildOfDescendant);
                lastChildOfDescendant = (this.getNodeOrNullAt(lastDeepestSiblingDescendantCandidate)?.children.length || 0) - 1;
            }
            nodeToFocus = this.getNodeOrNullAt(lastDeepestSiblingDescendantCandidate);
        } else {
            nodeToFocus = this.getNodeOrNullAt(currentPath.slice(0, -1));
        }
        nodeToFocus?.taker.focus();
    }

    focusNext(currentPath: TreePath) {
        let nodeToFocus: FocusTakerNode | undefined;
        const firstChild = this.getNodeOrNullAt([...currentPath, 0]);
        if (firstChild) {
            nodeToFocus = firstChild;
        } else {
            for (let i = currentPath.length - 1; i >= 0; i--) {
                const candidateAncestorSibling = this.getNodeOrNullAt([...currentPath.slice(0, i), currentPath[i] + 1]);
                if (candidateAncestorSibling) {
                    nodeToFocus = candidateAncestorSibling;
                    break;
                }
            }
        }
        if (nodeToFocus) {
            nodeToFocus.taker.focus();
        }
    }

    focusItem() {
        // TODO
    }
}


const emptyDirectory = () => {
    return {
        taker: {
            focus: () => {
                // root cannot take focus
            }
        },
        children: []
    };
}