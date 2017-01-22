var recognition = new webkitSpeechRecognition();
            var textarea = document.getElementById("result");
            var currentElement = undefined;
            var htmlTag = undefined;
            var scripting = false;
            var styling = false;
            
            var playing = true;
            var scripter;
            var styler;
            
            var playPause = function() {
                var button = document.getElementById("record");
                if (playing) {
                    recognition.stop();
                    recognition.onaudioend = undefined;
                    button.className="record fa fa-play";
                } else {
                    recognition.start();
                    recognition.onaudioend = function() {
                        setTimeout(function() {recognition.start();}, 1000);
                    }
                    button.className="record fa fa-pause";
                }
                playing = !playing;
            }
        
            function escapeHTML(unsafe) {
                return unsafe
                     .replace(/&/g, "&amp;")
                     .replace(/</g, "&lt;")
                     .replace(/>/g, "&gt;")
                     .replace(/"/g, "&quot;")
                     .replace(/'/g, "&#039;")
                     .replace(/\n/g, "<br>")
                     .replace(/\t/g, "&nbsp&nbsp&nbsp&nbsp")
                     .replace(/\*\~\*/g, "<span class='selected'>")
                     .replace(/\~\*\~/g, "</span>");
             }
        
            var writeElements = function() {
                var raw_text = "<!DOCTYPE html>\n" + htmlTag.toText(0);
                raw_text += scripter.toText();
                raw_text += styler.toText();
                var text = escapeHTML(raw_text);
                textarea.innerHTML = text;
                
                raw_text = raw_text.replace(/\*\~\*/g, "").replace(/\~\*\~/g, "");
                document.getElementById('iframe').src = "data:text/html;charset=utf-8," + raw_text;
            }
            
            var ScriptElement = function() {
                this.text = [];
                this.id = -1;
                this.currentLine = -1;
                
                this.toText = function() {
                    var data = "\n<script>\n";
                    for (var i = 0; i < this.text.length; i++) {
                        if (this.currentLine == i) {
                            data += "*~*";
                        }
                        data += this.text[i] + "\n";
                        if (this.currentLine == i) {
                            data += "~*~";
                        }
                    }
                    return data + "\n</script>\n";
                }
                
                this.addLine = function(text, words) {
                    console.log(words);
                    if (text == "remove line") {
                        this.text.splice(this.currentLine, 1);
                    }
                    
                    else if (["create", "great"].indexOf(words[0]) > -1 && ["function", "method"].indexOf(words[1]) > -1) {
                        var name = words[2];
                        this.text.push("function " + name + "() {   }");
                        this.currentLine++;
                    }
                    
                    else if (words[0] == "variable") {
                        var variableName = words[1];
                        if (words.length > 3) {
                            if (words[2] == "equals") {
                                
                                if (words.length == 4) {
                                    this.text.push("var " + variableName + " = \"" + words[3] + "\";")
                                    this.currentLine++;
                                } else {
                                    if (words[3] == "integer") {
                                        this.text.push("var " + variableName + " = " + words[4] + ";");
                                        this.currentLine++;
                                    } else if(words[3] == "float") {
                                        this.text.push("var " + variableName + " = " + words[4] + ";");
                                        this.currentLine++;
                                    } else {
                                        this.text.push("var " + variableName + " = \"" + words[4] + "\";");
                                        this.currentLine++;
                                    }
                                }
                            } else {
                                this.text.push("var " + variableName + ";");
                                this.currentLine++;
                            }
                        } else {
                            // just decalaring variable
                            this.text.push("var " + variableName + ";");
                            this.currentLine++;
                        }
                    }
                    else if (words[0] == "comment") {
                        this.text.push("// " + text.substring(8, text.length));
                        this.currentLine++;
                    }
                    writeElements();
                }
            }
            
            scripter = new ScriptElement();
            
            var CSSBlock = function(selector) {
                this.selector = selector;
                this.attr = {};
                
                this.text = function(selected) {
                    var data = "";
                    if (selected) {
                        data += "*~*";
                    }
                    
                    data += selector + " {\n";
                    for (prop in this.attr) {
                        data += "\t" + prop + ": " + this.attr[prop] + ";\n";
                    }
                    data += "}";
                    
                    if (selected) {
                        data += "*~*";
                    }
                    return data;
                }
            }
            
            var StyleElement = function() {
                this.blocks = [];
                this.currentBlock = -1;
                
                this.toText = function() {
                    var data = "";
                    if (this.currentBlock == -1 && styling) {
                        data += "*~*";
                    }
                    data += "\n<style>"
                    for (var i = 0; i < this.blocks.length; i++) {
                        if (this.currentBlock == i) {
                            data += "\n" + this.blocks[i].text(true);
                        } else {
                            data += "\n" + this.blocks[i].text(false);
                        }
                    }
                    data += "\n</style>"
                    if (this.currentBlock == -1 && styling) {
                        data += "~*~";
                    }
                    return data;
                }
                
                this.concat = function(parts) {
                    if (parts.length == 1) {
                        return parts[0];
                    }
                    if (parts.length == 0) {
                        return undefined;
                    }
                    
                    if (parts.length == 2 && (parts[1] == "pixels" || parts[1] == "pixel")) {
                        return parts[0] + "px";
                    }
                    
                    return parts.join("-");
                }
                
                this.command = function(text, words) {
                    if (words[0] == "select" && (words[1] == "class" || words[1] == "glass")) {
                        var selector = "." + words[2];
                        this.blocks.push(new CSSBlock(selector));
                        this.currentBlock = this.blocks.length - 1;
                    }
                    
                    if (words[0] == "select" && words[1] == "ID") {
                        var selector = "#" + words[2];
                        this.blocks.push(new CSSBlock(selector));
                        this.currentBlock = this.blocks.length - 1;
                    }
                    
                    if (words[0] == "set" && this.currentBlock > -1) {
                        var names = [];
                        var attrs = [];
                        var start = true;
                        for (var i = 1; i < words.length; i++) {
                            if (words[i] == "equals") {
                                start = false;
                            } else  if (start) {
                                names.push(words[i]);
                            } else {
                                attrs.push(words[i]);
                            }
                        }
                        var name = names.join("-");
                        var attr = this.concat(attrs);
                        this.blocks[this.currentBlock].attr[name] = attr;
                    }
                    writeElements();
                }
                
            }
            
            styler = new StyleElement();
        
            var Element = function(p, name) {
                this.name = name;
                this.children = [];
                this.attr = {};
                this.text = "";
                this.parentElem = p;
                this.id = Math.floor(Math.random() * 100000);
                
                this.findById = function(id) {
                    if (this.attr["ID"] == id) {
                        return this;
                    }
                    
                    for (var i = 0; i < this.children.length; i++) {
                        var response = this.children[i].findById(id);
                        if (response !== undefined) {
                            return response;
                        }
                    }
                    return undefined;
                }
                
                this.findByClassName = function(className) {
                    if (this.attr["class"] == className) {
                        return this;
                    }
                    
                    for (var i = 0; i < this.children.length; i++) {
                        var response = this.children[i].findById(className);
                        if (response !== undefined) {
                            return response;
                        }
                    }
                    return undefined;
                }
                
                this.attrText = function() {
                    var text = "";
                    for (prop in this.attr) {
                        text += prop + "=\"" + this.attr[prop] + "\" ";
                    }
                    return text;
                }
                
                this.toText = function(indent) {
                    
                    var start = "";
                    var end = "";
                    
                    if (this.id === currentElement.id && !scripting) {
                        start = "*~*";
                        end = "~*~";
                    }
                    
                    if (this.text.length > 0) {
                        return start + "<" + this.name + " " + this.attrText() + ">" + this.text + "</" + this.name + ">" + end;
                    }
                    
                    if (this.children.length == 0) {
                        return start + "<" + this.name + " " + this.attrText() + "/>" + end;
                    }
                    
                    var data = "";
                    
                    for (var j = 0; j < indent; j++) {
                        data += "\t";
                    }
                    
                    data = start + "<" + this.name + " " + this.attrText() + ">" + end;
                    
                    for (var i = 0; i < this.children.length; i++) {
                        data += "\n";
                        for (var j = 0; j < indent+1; j++) {
                            data += "\t";
                        }
                        data += this.children[i].toText(indent+1);
                    }
                    data += "\n";
                    for (var j = 0; j < indent; j++) {
                        data += "\t";
                    }
                    data += "</" + this.name + ">"
                    return data;
                }
            }
            
            // creates the nodes to start with
            var createTemplateNodes = function() {
                var html = new Element(undefined, "html")
                htmlTag = html;
                
                var headTag = new Element(html, "head")
                var bodyTag = new Element(html, "body")
                
                html.children.push(headTag);
                html.children.push(bodyTag);
                
                currentElement = html;
                writeElements();
            }
            
            
            recognition.onresult = function(event) {
              var text = event.results["0"]["0"].transcript;
              var words = text.split(" ");
              document.getElementById("test").innerHTML = words;
              
              
              if (scripting) {
                  if (text == "end script") {
                      scripting = false;
                      currentElement = htmlTag;
                  } else {
                      scripter.addLine(text, words);
                  }
                  writeElements();
                  return;
              }
              
              if (styling) {
                  if (text == "end Style" || text == "end styles" || text == "N Style" || text == "and style" || text == "and styles") {
                      styling = false;
                      currentElement = htmlTag;
                  } else {
                      styler.command(text, words);
                  }
                  writeElements();
                  return;
              }
              
              if (text == "create document" || text == "great document" || text == "create documents" || text == "great document") {
                  createTemplateNodes();
              }
              
              if (["move", "go", "enter"].indexOf(words[0]) > -1 && ["to", "into"].indexOf(words[1]) > -1 && ["Tech", "tag", "fat", "element", "day"].indexOf(words[3]) > -1) {
                  var tagToMoveTo = words[2];
                  for (var i = 0; i < currentElement.children.length; i++) {
                      if (currentElement.children[i].name == tagToMoveTo) {
                          currentElement = currentElement.children[i];
                          break;
                      }
                  }
                  writeElements();
              }
              
              if (text == "move to parent" || text == "move to parents" || text == "move to Paris" || text == "moves to parent" || text == "moves to parents" || text == "moves to Paris") {
                  if (currentElement.parentElem !== undefined) {
                    currentElement = currentElement.parentElem;
                  }
                  writeElements();
              }
              
              if (["create", "add"].indexOf(words[0]) > -1 && ["Tech", "tag", "element", "day", "fzt"].indexOf(words[2]) > -1) {
                  if (words[1] == "paragraph") {
                      words[1] = "p";
                  }
                  if (words[1] == "divider") {
                      words[1] = "div";
                  }
                  var tagName = words[1];
                  var e = new Element(currentElement, tagName);
                  currentElement.children.push(e);
                  currentElement = e;
                  writeElements();
              }
              
              if (words[0] == "type") {
                  var text = "";
                  for (var x = 1; x < words.length; x++) {
                     text += words[x] + " ";
                  }
                  text = text.slice(0, -1);
                  if (currentElement.children.length == 0) {
                    currentElement.text = text;
                  }
                  writeElements();
              }
              
              if ((words[0] == "set" || words[0] == "send") && words[1] == "text") {
                  var text = "";
                  for (var x = 2; x < words.length; x++) {
                     text += words[x] + " ";
                  }
                  text = text.slice(0, -1);
                  if (currentElement.children.length == 0) {
                    currentElement.text = text;
                  }
                  writeElements();
              }
              
              if (words[0] == "delete" && words[1] == "attribute") {
                  currentElement.attr[words[2]] = undefined;
              }
              
              if (words[0] == "next" && words[1] == "child") {
                  var childs = currentElement.parentElem.children;
                  var index = childs.indexOf(currentElement) + 1;
                  if (index < childs.length) {
                      currentElement = childs[index];
                  }
                  writeElements();
              }
              
              if ((words[0] == "set" || words[0] == "send") && words[1] == "attribute" && words[3] == "equals") {
                  var property = words[2];
                  var value = words[4];
                  currentElement.attr[property] = value;
                  writeElements();
              }
              
              if (words[0] == "select" && words[2] == "ID") {
                  var id = words[1];
                  var element = htmlTag.findById(id);
                  if (element !== undefined) {
                    currentElement = element;
                  }
                  writeElements();
              }
              
              if (words[0] == "select" && words[2] == "class") {
                  var className = words[1];
                  var element = htmlTag.findByClassName(className);
                  if (element !== undefined) {
                    currentElement = element;
                  }
                  writeElements();
              }
              
              if (text == "remove") {
                  var removed = currentElement;
                  currentElement = currentElement.parentElem;
                  var index = currentElement.children.indexOf(removed);
                  currentElement.children.splice(index, 1);
                  writeElements();
              }
              
              if (text == "start script") {
                  scripting = true;
                  styling = false;
                  currentElement = scripter;
              }
              
              if (text == "start Style" || text == "start styles") {
                  scripting = false;
                  styling = true;
                  currentElement = styler;
              }
            }
            
            recognition.onaudioend = function() {
                setTimeout(function() {recognition.start();}, 1000);
            }
            
            recognition.start();