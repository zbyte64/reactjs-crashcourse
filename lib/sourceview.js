function fixExtraIndent(content) {
  function countspace(line) {
    var r = line.match(/^\s*/);
    if (!r) return 0;
    return r[0].length;
  }

  var lines = content.split(/\n/);
  var returnlines = []
  var guttersize = null;
  _.each(lines, function(line) {
    if (guttersize == null) {
      var gspace = countspace(line)
      if (gspace == line.length) {
        return;
      } else {
        guttersize = gspace;
      }
    }
    returnlines.push(line.substr(guttersize));
  });
  return returnlines.join("\n");
}

var SourceCode = React.createClass({
  propTypes: {
    sourceId: React.PropTypes.string,
    language: React.PropTypes.string,
    liveEdit: React.PropTypes.bool
  },
  getDefaultProps: function() {
    return {
      language: "jsx"
    }
  },
  getInitialState: function() {
    return {
      source: fixExtraIndent(document.getElementById(this.props.sourceId).innerHTML)
    };
  },
  componentDidMount: function() {
    Prism.highlightElement(this.refs.source.getDOMNode());
  },
  componentDidUpdate: function() {
    Prism.highlightElement(this.refs.source.getDOMNode());
  },
  refreshCode: function() {
    var node = this.refs.source.getDOMNode(),
        code = node.innerText || node.textContent;
    if (!code) return;
    try {
      var result = JSXTransformer.transform(code)
      var jscode = result['code']
      eval(jscode)
    } catch(e) {
      console.log("JSX compile error:", e)
      return
    }

  },
  render: function() {
    return React.DOM.pre({},
      React.DOM.code({
        onBlur: this.refreshCode,
        onInput: this.refreshCode,
        contentEditable: this.props.liveEdit,
        className: "language-"+this.props.language,
        ref: "source"}, this.state.source));
  }
});

(function(d, w){
  window.addEventListener("load", function() {
    Prism.languages.jsx = _.merge({}, Prism.languages.javascript, Prism.languages.markup);

    _.each(d.querySelectorAll(".sourceCode"), function(el) {
      React.renderComponent(SourceCode({sourceId: el.dataset.source,
                                        language: el.dataset.language,
                                        liveEdit: el.dataset.edit ? true : false}),
                            el);
    }, false);
  })
}(document, window));
