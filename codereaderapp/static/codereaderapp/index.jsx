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
    handleLocationClick: function(location) {
        this.addElement({type: "file", name: location.file, highlight: location.highlight});
    },
    handleSearchSubmit: function(event) {
        event.preventDefault();
        var term = React.findDOMNode(this.refs.search).value.trim();
        this.addElement({type: "search_result", term: term});
    },
    renderElement: function(element) {
        if (element.type === "file") {
            return <File name={element.name} highlight={element.highlight} />;
        } else if (element.type === "search_result") {
            return <SearchResult handleLocationClick={this.handleLocationClick} term={element.term} />;
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
                            <button type="button" className="navbar-toggle collapsed" data-toggle="collapse" data-target="#navbar" aria-expanded="false" aria-controls="navbar">
                                <span className="sr-only">Toggle navigation</span>
                                <span className="icon-bar"></span>
                                <span className="icon-bar"></span>
                                <span className="icon-bar"></span>
                            </button>
                            <a className="navbar-brand" href="/">Code Reader</a>
                        </div>
                        <div id="navbar" className="collapse navbar-collapse">
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
                    <div className="row">
                        <div className="col-md-3">
                            <FileBrowser handleLocationClick={this.handleLocationClick} />
                        </div>
                        <div className="col-md-9">
                            {this.state.elements.map(this.renderElement)}
                        </div>
                    </div>
                </div>
            </div>
        );
    }
});

var FileBrowser = React.createClass({
    getInitialState: function() {
        return {
            path: [],
            items: []
        };
    },
    componentDidMount: function() {
        this.loadDirectory(".");
    },
    handleDirectoryClick: function(item) {
        this.loadDirectory(item.value);
    },
    loadDirectory: function(directory) {
        $.get('/directory/', {directory: directory}, function(result) {
            this.setState(result);
        }.bind(this));
    },
    render: function() {
        return (
            <div className="panel panel-default">
                <div className="panel-heading">
                    {this.renderBreadcrumb()}
                </div>
                {this.renderList()}
            </div>
        );
    },
    renderBreadcrumb: function() {
        var items = this.state.path.map(function(item, index) {
            if (index === 0) {
                var text = (
                    <span className="glyphicon glyphicon-home"
                          aria-hidden="true" />
                );
            } else {
                var text = item.text;
            }
            if (index === (this.state.path.length - 1)) {
                var activeClass = "active";
                var body = text;
            } else {
                var body = (
                    <Link text={item.text}
                          handleClick={this.handleDirectoryClick}
                          clickData={item}>
                        {text}
                    </Link>
                );
            }
            return (
                <li className={activeClass}>
                    {body}
                </li>
            );
        }.bind(this));
        return (
            <ol className="breadcrumb breadcrumb-header">
                {items}
            </ol>
        );
    },
    renderList: function() {
        var items = this.state.items.map(function(item) {
            if (item.type === "directory") {
                return (
                    <li className="list-group-item">
                        <span className="glyphicon glyphicon-folder-close"
                              aria-hidden="true" />
                        {" "}
                        <Link handleClick={this.handleDirectoryClick}
                              clickData={item}>
                            {item.text}
                        </Link>
                    </li>
                );
            } else if (item.type === "file") {
                var clickData = {
                    file: item.value,
                    row: 0,
                    highlight: ""
                };
                return (
                    <li className="list-group-item">
                        <span className="glyphicon glyphicon-file"
                              aria-hidden="true" />
                        {" "}
                        <Link handleClick={this.props.handleLocationClick}
                              clickData={clickData}>
                            {item.text}
                        </Link>
                    </li>
                );
            }
        }.bind(this));
        return (
            <ul className="list-group">
                {items}
            </ul>
        );
    }
});

var File = React.createClass({
    getInitialState: function() {
        return {
        };
    },
    componentDidMount: function() {
        var params = {
            name: this.props.name,
            highlight: this.props.highlight
        };
        $.get('/file/', params, function(result) {
            result.selectedRow = location.row;
            this.setState(result);
        }.bind(this));
        this.getDOMNode().scrollIntoView();
    },
    render: function() {
        return (
            <div className="panel panel-default">
                <div className="panel-heading">
                    <strong>{this.props.name}</strong>
                </div>
                {this.renderBody()}
            </div>
        );
    },
    renderBody: function() {
        if (this.state.lines) {
            return (
                <div className="panel-body file-content">
                    <Lines selectedRow={this.state.selectedRow} lines={this.state.lines} />
                </div>
            );
        } else {
            return (
                <div className="panel-body">
                    <span>Loading...</span>
                </div>
            );
        }
    }
});

var Lines = React.createClass({
    shouldComponentUpdate: function(nextProps, nextState) {
        return (nextProps.lines !== this.props.lines);
    },
    render: function() {
        var expectedRow = undefined;
        var lines = []
        this.props.lines.map(function(line) {
            if (expectedRow !== undefined && expectedRow !== line.row) {
                lines.push(
                    <tr>
                        <td className="codeRow">
                            <code>...</code>
                        </td>
                        <td className="codeLine">
                            <code></code>
                        </td>
                    </tr>
                );
            }
            expectedRow = line.row + 1;
            var shouldScrollTo = this.props.selectedRow === line.row || (this.props.selectedRow === undefined && line.row === 1);
            lines.push(
                <Line shouldScrollTo={shouldScrollTo} line={line} key={line.row} />
            );
        }.bind(this));
        return (
            <div className="lines">
                <table>
                    {lines}
                </table>
            </div>
        );
    },
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
            <tr>
                <td className="codeRow">
                    <code>{this.props.line.row}</code>
                </td>
                <td className="codeLine">
                    <code>{parts}</code>
                </td>
            </tr>
        );
    }
});

var SearchResult = React.createClass({
    getInitialState: function() {
        return {
        };
    },
    componentDidMount: function() {
        this.getDOMNode().scrollIntoView();
        $.get('/search/' + this.props.term, function(result) {
            this.setState({matches: result.matches});
        }.bind(this));
    },
    render: function() {
        return (
            <div className="panel panel-default">
                <div className="panel-heading">
                    <strong>Search results: {this.props.term}</strong>
                </div>
                {this.renderBody()}
            </div>
        );
    },
    renderBody: function() {
        if (this.state.matches === undefined) {
            return this.renderBodyLoading();
        } else {
            return this.renderBodyMatches();
        }
    },
    renderBodyLoading: function() {
        return (
            <div className="panel-body">
                <span>Loading...</span>
            </div>
        );
    },
    renderBodyMatches: function() {
        return (
            <ul className="list-group search-result">
                {this.state.matches.map(this.renderMatchItem)}
            </ul>
        );
    },
    renderMatchItem: function(match) {
        return (
            <li className="list-group-item">
                <span className="list-group-item-text">
                    <LocationLink file={match.file}
                                  row={match.row}
                                  highlight={this.props.term}
                                  handleLocationClick={this.props.handleLocationClick} />
                </span>
                <span className="list-group-item-text">
                    <Lines lines={match.lines} />
                </span>
            </li>
        );
    }
});

var LocationLink = React.createClass({
    render: function() {
        var clickData = {
            file: this.props.file,
            row: this.props.row,
            highlight: this.props.highlight
        };
        return (
            <Link handleClick={this.props.handleLocationClick}
                  clickData={clickData}>
                {this.props.file}
            </Link>
        );
    }
});

var Link = React.createClass({
    handleClick: function(event) {
        event.preventDefault();
        this.props.handleClick(this.props.clickData);
    },
    render: function() {
        return (
            <a href="#" onClick={this.handleClick}>{this.props.children}</a>
        );
    }
});

$(function() {
    React.render(
        <CodeReader />,
        document.getElementById('content')
    );
});
