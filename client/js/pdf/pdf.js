const pdf = (function() {
  const layout = `
<h2>Binary Trees and Binary Search Trees</h2>
<p>Trees are a commonly used data structure in computer science. A tree is a nonlinear
data structure that is used to store data in a hierarchical manner. Tree data structures
are used to store hierarchical data, such as the files in a file system, and for storing sorted
lists of data. We examine one particular tree structure in this chapter: the binary tree.
Binary trees are chosen over other more primary data structures because you can search
a binary tree very quickly (as opposed to a linked list, for example) and you can quickly
insert and delete data from a binary tree (as opposed to an array).</p>
<h3>Trees Defined</h3>
<p>A tree is made up of a set of nodes connected by edges. An example of a tree is a company’s
organizational chart (see Figure 10-1).</p>
<p>The purpose of an organizational chart is to communicate the structure of an organi‐
zation. In Figure 10-1, each box is a node, and the lines connecting the boxes are the
edges. The nodes represent the positions that make up an organization, and the edges
represent the relationships between those positions. For example, the CIO reports di‐
rectly to the CEO, so there is an edge between those two nodes. The development man‐
ager reports to the CIO, so there is an edge connecting those two positions. The VP of
Sales and the development manager do not have a direct edge connecting them, so there
is not a direct relationship between those two positions.</p>
`;

  const HIDDEN_CLASS = 'hidden';

  let rootDomElement;

  const init = function(containerToAdd) {
    rootDomElement = document.createElement('div');
    rootDomElement.innerHTML = layout;
    rootDomElement.className = `pdf-reader ${HIDDEN_CLASS}`;

    containerToAdd.appendChild(rootDomElement);
  };

  const show = function() {
    rootDomElement.classList.remove(HIDDEN_CLASS);
  };

  const hide = function() {
    rootDomElement.classList.add(HIDDEN_CLASS);
  };

  const addSelectionEventListener = function(callback) {
    function getSelectionText() {
      var txt = '';
      if (txt = window.getSelection) { // Не IE, используем метод getSelection
        txt = window.getSelection().toString();
      } else { // IE, используем объект selection
        txt = document.selection.createRange().text;
      }
      return txt;
    }

    rootDomElement.addEventListener('mouseup',
      function(event) {
        if (callback) callback(getSelectionText());
      });
  };

  const removeSelectionEventListener = function(eventType) {
    rootDomElement.removeEventListener('mouseup');
  };

  const destroy = function() {
    hide();
    rootDomElement.remove();
    rootDomElement = null;
  };

  return {
    init,
    show,
    hide,
    addSelectionEventListener,
    removeSelectionEventListener,
    destroy
  };
})();
