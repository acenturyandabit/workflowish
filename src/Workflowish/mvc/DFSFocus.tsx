export type TreePath = number[];

export const treeEquals = (left: TreePath, right: TreePath) => {
    return left.reduce((prev, i, ii) => prev && right[ii] == i, true);
}

export type IdAndFocusPath = {
    id: string,
    treePath: TreePath
}

export type FocusRequest = {
    id: string,
    end?: boolean,
    treePathHint?: TreePath
}

export type FocusTaker = {
    focus: (end?: boolean) => void
}

export type FocusTakerNode = {
    taker: FocusTaker
    children: FocusTakerNode[]
}

type FocusTakerEntry = {
    focusTaker: FocusTaker,
    treePath: TreePath
}

export class DFSFocusManager {
    focusTakerTree!: FocusTakerNode;
    focusTakersById!: Record<string, Set<FocusTakerEntry>>;
    constructor() {
        this.emptyThis();
        this.focusItem = this.focusItem.bind(this);
    }

    emptyThis() {
        this.focusTakerTree = emptyDirectory();
        this.focusTakersById = {}
    }

    childPath(currentPath: TreePath, idx: number): TreePath {
        return [...currentPath, idx];
    }

    getOrInsertNodeAt(currentPath: TreePath, nodeToInsert?: FocusTaker): FocusTakerNode {
        let currentItem = this.focusTakerTree;
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
        let currentItem = this.focusTakerTree;
        for (let pathIdx = 0; pathIdx < currentPath.length; pathIdx++) {
            currentItem = currentItem.children[currentPath[pathIdx]];
            if (!currentItem) break;
        }
        return currentItem;
    }

    registerChild(currentPath: TreePath, id: string, focusTaker: FocusTaker) {
        this.getOrInsertNodeAt(currentPath, focusTaker);
        if (!this.focusTakersById[id]) this.focusTakersById[id] = new Set();
        this.focusTakersById[id].add({ focusTaker, treePath: currentPath });
    }

    focusPrev(currentPath: TreePath) {
        let nodeToFocus: FocusTakerNode | undefined;
        if (currentPath[currentPath.length - 1] > 0) {
            const previousSibling: TreePath = [...currentPath.slice(0, -1), currentPath[currentPath.length - 1] - 1];
            const lastDeepestSiblingDescendantCandidate: TreePath = previousSibling;
            // don't have to worry about iscollapsed here since we re-index the tree after each render
            // Try to get last deepest child ancestor of sibling
            let lastChildOfDescendant = (this.getNodeOrNullAt(lastDeepestSiblingDescendantCandidate)?.children.length || 0) - 1;
            while (lastChildOfDescendant >= 0) {
                lastDeepestSiblingDescendantCandidate.push(lastChildOfDescendant);
                lastChildOfDescendant = (this.getNodeOrNullAt(lastDeepestSiblingDescendantCandidate)?.children.length || 0) - 1;
            }
            nodeToFocus = this.getNodeOrNullAt(lastDeepestSiblingDescendantCandidate);
        } else {
            nodeToFocus = this.getNodeOrNullAt(currentPath.slice(0, -1));
        }
        nodeToFocus?.taker.focus(true);
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

    focusItem(focusRequest: FocusRequest) {
        const id = focusRequest.id;
        if (this.focusTakersById[id]) {
            const focusCandidates = this.focusTakersById[id];
            let chosenFocusEntry: FocusTakerEntry = [...focusCandidates.values()][0];
            if (focusRequest.treePathHint) {
                const treePathHint = focusRequest.treePathHint;
                focusCandidates.forEach(entry => {
                    chosenFocusEntry = chooseCloserOf(entry, chosenFocusEntry, treePathHint);
                })
            }
            chosenFocusEntry.focusTaker.focus(focusRequest.end);
        }
    }
}

const chooseCloserOf = (left: FocusTakerEntry, right: FocusTakerEntry, treePath: TreePath): FocusTakerEntry => {
    const deepestCommonLevel = (leftTreePath: TreePath, rightTreePath: TreePath) => {
        const longerList = leftTreePath.length > rightTreePath.length ? leftTreePath : rightTreePath;
        const otherList = leftTreePath.length > rightTreePath.length ? rightTreePath : leftTreePath;
        return longerList.reduce((state, i, ii) => {
            if (otherList[ii] == i && state.valid) state.deepest = ii;
            else state.valid = false;
            return state;
        }, { deepest: -1, valid: true }).deepest;
    }
    const leftDeepest = deepestCommonLevel(left.treePath, treePath);
    const rightDeepest = deepestCommonLevel(right.treePath, treePath);
    // TODO: lots of room for finer cases here but this case isn't used often yet
    return (leftDeepest > rightDeepest) ? left : right;
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