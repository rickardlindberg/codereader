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
        $.get('/search/' + term, function(result) {
            this.addElement({type: "search_result", value: result});
        }.bind(this));
    },
    renderElement: function(element) {
        if (element.type === "file") {
            return <File name={element.name} highlight={element.highlight} />;
        } else if (element.type === "search_result") {
            return <SearchResult handleLocationClick={this.handleLocationClick} result={element.value} />;
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
    shouldComponentUpdate: function(nextProps, nextState) {
        return ((nextProps.name !== this.props.name) || (nextState.lines !== this.state.lines));
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
            var lines = this.state.lines.map(function(line) {
                var shouldScrollTo = this.state.selectedRow === line.row || (this.state.selectedRow === undefined && line.row === 1);
                return <Line shouldScrollTo={shouldScrollTo} line={line} key={line.row} />;
            }.bind(this));
            return (
                <div className="panel-body file-content">
                    <pre>
                        {lines}
                    </pre>
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
                        <LocationLink file={match.file} row={match.row} highlight={this.props.result.term} handleLocationClick={this.props.handleLocationClick} />
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
