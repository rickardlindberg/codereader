var CodeReader = React.createClass({
    getInitialState: function() {
        return {
            elements: []
        };
    },
    addElement: function(element) {
        this.setState({
            elements: this.state.elements.concat([element])
        });
    },
    onLocationClicked: function(location) {
        $.get('/file/', {name: location.file}, function(result) {
            result.selectedRow = location.row;
            this.addElement({type: "file", value: result});
        }.bind(this));
    },
    handleSearchSubmit: function(event) {
        event.preventDefault();
        var term = React.findDOMNode(this.refs.search).value.trim();
        $.get('/search/' + term, function(result) {
            this.addElement({type: "search_result", value: result});
        }.bind(this));
    },
    renderElement: function(element) {
        if (element.type === "file") {
            return <File file={element.value} />;
        } else if (element.type === "search_result") {
            return <SearchResult onLocationClicked={this.onLocationClicked} result={element.value} />;
        } else {
            return <span>{element.value}</span>;
        }
    },
    render: function() {
        return (
            <div>
                <nav className="navbar navbar-default navbar-fixed-top">
                  <div className="container">
                      <div className="navbar-header">
                          <span className="navbar-brand">Code Reader</span>
                      </div>
                      <div className="collapse navbar-collapse" id="bs-example-navbar-collapse-1">
                          <ul className="nav navbar-nav">
                              <li className="dropdown">
                                  <a href="#" className="dropdown-toggle" data-toggle="dropdown" role="button" aria-haspopup="true" aria-expanded="false">Files <span className="caret"></span></a>
                                  <FileMenu onLocationClicked={this.onLocationClicked} />
                              </li>
                          </ul>
                          <form className="navbar-form navbar-left" role="search" onSubmit={this.handleSearchSubmit}>
                              <div className="form-group">
                                  <input type="text" className="form-control" placeholder="Search" ref="search" />
                              </div>
                              <button type="submit" className="btn btn-default">Find</button>
                          </form>
                      </div>
                  </div>
                </nav>
                <div className="container">
                    {this.state.elements.map(this.renderElement)}
                </div>
            </div>
        );
    }
});

var FileMenu = React.createClass({
    getInitialState: function() {
        return {
            files: []
        };
    },
    componentDidMount: function() {
        $.get('/file_list', function(result) {
            this.setState(result);
        }.bind(this));
    },
    render: function() {
        var links = this.state.files.map(function(file) {
            return (
                <li>
                    <LocationLink file={file} onLocationClicked={this.props.onLocationClicked} />
                </li>
            )
        }.bind(this));
        return (
            <ul className="dropdown-menu">
                {links}
            </ul>
        );
    }
});

var File = React.createClass({
    componentDidMount: function() {
        this.getDOMNode().scrollIntoView();
    },
    render: function() {
        var lines = this.props.file.lines.map(function(line) {
            var shouldScrollTo = this.props.file.selectedRow === line.row || (this.props.file.selectedRow === undefined && line.row === 1);
            return <Line shouldScrollTo={shouldScrollTo} line={line} />;
        }.bind(this));
        return (
            <div className="panel panel-default">
                <div className="panel-heading">
                    <strong>{this.props.file.name}</strong>
                </div>
                <div className="panel-body file-content">
                    <pre>
                        {lines}
                    </pre>
                </div>
            </div>
        );
    }
});

var Line = React.createClass({
    componentDidMount: function() {
        if (this.props.shouldScrollTo) {
            this.getDOMNode().scrollIntoView();
        }
    },
    render: function() {
        var parts = this.props.line.parts.map(function(part) {
            var classes = "";
            part.annotations.map(function(annotation) {
                if (annotation.type === "style") {
                    classes += annotation.what;
                    classes += " ";
                }
            });
            return (
                <span className={classes}>
                    {part.text}
                </span>
            );
        });
        return (
            <span>
                {parts}
            </span>
        );
    }
});

var SearchResult = React.createClass({
    componentDidMount: function() {
        this.getDOMNode().scrollIntoView();
    },
    render: function() {
        var matches = this.props.result.matches.map(function(match) {
            var lines = match.lines.map(function(line) {
                return <Line shouldScrollTo={false} line={line} />;
            }.bind(this));
            return (
                <li className="list-group-item">
                    <span className="list-group-item-text">
                        <LocationLink file={match.file} row={match.row} onLocationClicked={this.props.onLocationClicked} />
                    </span>
                    <span className="list-group-item-text file-content">
                        <pre>
                            {lines}
                        </pre>
                    </span>
                </li>
            );
        }.bind(this));
        return (
            <div className="panel panel-default">
                <div className="panel-heading">
                    <strong>Search results: {this.props.result.term}</strong>
                </div>
                <ul className="list-group search-result">
                    {matches}
                </ul>
            </div>
        );
    }
});

var LocationLink = React.createClass({
    handleClick: function(event) {
        event.preventDefault();
        this.props.onLocationClicked({
            file: this.props.file,
            row: this.props.row
        });
    },
    render: function() {
        return (
            <a href="#" onClick={this.handleClick}>{this.props.file}</a>
        );
    }
});

React.render(
    <CodeReader />,
    document.getElementById('content')
);
