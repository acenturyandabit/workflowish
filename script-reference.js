/* The scripting engine exposes the following globals: */

/* -----  Global variables ------ */
// Anything declared in your script scope is guaranteed to persist 
// until you hit 'reload' or reload the page. I'm going to regret  
// guaranteeing this later, but hey, it makes your life easier, 
// so yay for you!

/* ----- instance -----*/
// Perform a transformation whenever an object is changed
instance.on("updateItem", (key, item)=>{
    // Do stuff with the item, e.g.
    console.log(item.data)
    item.data = item.data.replace("foo","bar")
    
    // To save your changes:
    instance.updateItem(key, item);
})