var FileView = React.createClass({
    getInitialState: function() {
        return {
            files: []
        };
    },
    onLocationSelected: function(location) {
        $.get('/file/' + location.file, function(result) {
            result.selectedRow = location.row;
            this.setState({
                files: this.state.files.concat([{type: "file", value: result}])
            });
        }.bind(this));
    },
    handleSubmit: function(event) {
        event.preventDefault();
        var term = React.findDOMNode(this.refs.search).value.trim();
        $.get('/search/' + term, function(result) {
            this.setState({
                files: this.state.files.concat([{type: "search_result", value: result}])
            });
        }.bind(this));
    },
    render: function() {
        var files = this.state.files.map(function(file) {
            if (file.type === "file") {
                return <File file={file.value} />;
            } else if (file.type === "search_result") {
                return <SearchResult onLocationSelected={this.onLocationSelected} result={file.value} />;
            } else {
                return <span>{file.value}</span>;
            }
        }.bind(this));
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
                                  <LocationSearch onLocationSelected={this.onLocationSelected} />
                              </li>
                          </ul>
                          <form className="navbar-form navbar-left" role="search" onSubmit={this.handleSubmit}>
                              <div className="form-group">
                                  <input type="text" className="form-control" placeholder="Search" ref="search" />
                              </div>
                              <button type="submit" className="btn btn-default">Find</button>
                          </form>
                      </div>
                  </div>
                </nav>
                <div className="container">
                    {files}
                </div>
            </div>
        );
    }
});

var LocationSearch = React.createClass({
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
                    <LocationLink name={file} onLocationSelected={this.props.onLocationSelected} />
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

var LocationLink = React.createClass({
    onClick: function(event) {
        this.props.onLocationSelected({
            file: this.props.name,
            row: this.props.row
        });
        event.preventDefault();
    },
    render: function() {
        return (
            <a href="#" onClick={this.onClick}>{this.props.name}</a>
        );
    }
});

var File = React.createClass({
    componentDidMount: function() {
        this.getDOMNode().scrollIntoView();
    },
    render: function() {
        var lines = this.props.file.lines.map(function(line) {
            var scrollTo = this.props.file.selectedRow === line.row;
            return <Line scrollTo={scrollTo} line={line} />;
        }.bind(this));
        return (
            <div className="panel panel-default">
                <div className="panel-heading">
                    <strong>{this.props.file.name}</strong>
                </div>
                <div className="fileBody code">
                    <pre>
                        {lines}
                    </pre>
                </div>
            </div>
        );
    }
});

var SearchResult = React.createClass({
    componentDidMount: function() {
        this.getDOMNode().scrollIntoView();
    },
    render: function() {
        var matches = this.props.result.matches.map(function(match) {
            return (
                <li className="list-group-item">
                    <LocationLink name={match.file} row={match.row} onLocationSelected={this.props.onLocationSelected} />
                </li>
            );
        }.bind(this));
        return (
            <div className="panel panel-default">
                <div className="panel-heading">
                    <strong>Search results: {this.props.result.term}</strong>
                </div>
                <ul className="list-group">
                    {matches}
                </ul>
            </div>
        );
    }
});

var Line = React.createClass({
    componentDidMount: function() {
        if (this.props.scrollTo) {
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

React.render(
    <FileView />,
    document.getElementById('content')
);
