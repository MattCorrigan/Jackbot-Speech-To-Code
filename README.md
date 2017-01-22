Jackbot-Speech to Code
=======================
Ever get sudden inspiration but have no time to pursue it? Find yourself wanting to sketch out that site you had in mind? Well look no further than Jackbot! Jackbot is short hand for programmers, allowing them to create a basic outline of what they want to do.

Table of Contents
-----------------
- [Starting](#starting)
- [Movement](#movement)
- [Adding/Removing](#adding/removing)
- [Scripting](#scripting)
  
Starting
--------
 In order to start taking notes, you will need to create a new document. This will be the outline of the new HTML page.
  - Say "create Document"


Movement
--------
The orange font is where you currently are in the foundation. **You can only edit and add to the code based on your highlighted position.** There are a couple of commands that will allow you to get to where you need to go.
- Saying **"Move to "** + **"body tag"** or **"head tag"** will move you to those respective tags.
- Saying **"Next child"** will move you to the next tag.
- Saying **"Move Parent"** will move you to the previous tag.
- Saying **"Select by [class, id]"** will move you to the first tag that has that class and id.
- Saying **"Select by name"** will move you to the first instance of name inside of the body or head tag, depending on which you are in. 

Adding/Removing
---------------
You can add and delete tags, text, and attributes inside of the element you are in.
- Saying **"Add [paragraph, a, divider] tag"** will create a p, a, or div tag inside your current location.
- Saying **"[Type, Set text] + '[WORD]'"** will create text inside your current location.
- Saying **"Set attribute [attribute] equals" + "[WORD]"** will create an attribute and set its value to the text.
- Saying **"Remove" + "the element you want to remove"** will remove that element.

Scripting
---------
Javascript is stored in a script tag below the HTML, and can be coded using speech as well.
- Saying **"Start Script"** will allow you to add Javascript using the commands below.
- Saying **"End Script"** will end your scripting session, and you will switch back to speaking HTML commands.

- Saying **"Variable [variableName] equals [variableType] [variableValue]"** will allow you to create variables. There are a few variations and examples on this shown below.
a. **"Variable age equals integer 43"** will produce the Javascript **"var age = 43;"**.
b. **"Variable height equals float 5.85"** will produce the Javascript **"var height = 5.85"**.
c. **"Variable name equals string Robert"** will produce the Javascript **'var name = "Robert";'**.
d. The default type for a variable is a string, so omitting 'string' in the previous example would produce the same result. **"Variable name equals Robert"** will produce the Javascript **'var name = "Robert";'**.
e. Variables may be declared without being instantiated. **"Variable car"** will produce the Javascript **"var car;"**.

- Saying **"Comment [comment]"** will allow you to produce comments. For example, **"Comment hello, world!"** will produce **"// hello, world!"**.

- Saying **"Create function [functionName]"** will create an empty function for Javascript code.
