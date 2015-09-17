var CodeReader = React.createClass({
    getInitialState: function() {
        return {
            elements: [],
            counter: 0
        };
    },
    addElement: function(element) {
        this.setState({
            elements: Array.prototype.concat(element, this.state.elements),
            counter: this.state.counter + 1
        });
    },
    handleLocationClick: function(location) {
        this.addElement({
            counter: this.state.counter,
            type: "file",
            name: location.file,
            row: location.row,
            highlight: location.highlight
        });
    },
    handleSearchSubmit: function(event) {
        event.preventDefault();
        this.addElement({
            counter: this.state.counter,
            type: "search_result",
            term: React.findDOMNode(this.refs.search).value.trim()
        });
    },
    renderElement: function(element, index) {
        if (element.type === "file") {
            var child = (
                <File
                    name={element.name}
                    highlight={element.highlight}
                    selectedRow={element.row}
                />
            );
        } else if (element.type === "search_result") {
            var child = (
                <SearchResult
                    handleLocationClick={this.handleLocationClick}
                    term={element.term}
                />
            );
        }
        var classNames = ["col-lg-6"];
        if (index === 0) {
            classNames.push("big-container");
        }
        if (index > 0) {
            classNames.push("small-container");
        }
        return (
            <div className={classNames.join(" ")} key={element.counter}>
                {child}
            </div>
        );
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
                <div className="container-fluid">
                    <div className="row">
                        <div className="col-md-2">
                            <FileBrowser handleLocationClick={this.handleLocationClick} />
                        </div>
                        <div className="col-md-10">
                            <div className="row">
                                {this.state.elements.map(this.renderElement)}
                            </div>
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
        $.get('directory/', {
            directory: directory
        }).done(function(result) {
            result.items.sort(function(left, right) {
                if (left.type === "directory" && right.type !== "directory") {
                    return -1;
                } else if (right.type === "directory" && left.type !== "directory") {
                    return 1;
                } else if (left.text < right.text) {
                    return -1;
                } else if (left.text > right.text) {
                    return 1;
                } else {
                    return 0;
                }
            });
            this.replaceState(result);
        }.bind(this)).fail(function(error) {
            this.setState({
                error: true
            });
        }.bind(this));
    },
    render: function() {
        return (
            <BootstrapPanel error={this.state.error}>
                <div className="panel-heading">
                    {this.renderBreadcrumb()}
                </div>
                {this.renderList()}
            </BootstrapPanel>
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
                <li className={activeClass} key={item.value}>
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
                    <li className="list-group-item" key={item.value}>
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
                    <li className="list-group-item" key={item.value}>
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
        this.load();
    },
    load: function() {
        $.get('file/', {
            name: this.props.name,
            highlight: this.props.highlight
        }).done(function(result) {
            this.setState(result);
        }.bind(this)).fail(function(error) {
            this.setState({
                error: true
            });
        }.bind(this));
    },
    render: function() {
        return (
            <BootstrapPanel error={this.state.error}>
                <div className="panel-heading">
                    <strong>{this.props.name}</strong>
                </div>
                {this.renderBody()}
            </BootstrapPanel>
        );
    },
    renderBody: function() {
        if (this.state.lines) {
            return (
                <div className="panel-body lines-body">
                    <Lines selectedRow={this.props.selectedRow} lines={this.state.lines} />
                </div>
            );
        } else if (this.state.error) {
            return <BootstrapPanelBodyError />;
        } else {
            return <BootstrapPanelBodyLoading />;
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
                    <tr key={expectedRow}>
                        <td className="line-row">
                            <code>...</code>
                        </td>
                        <td className="line-content">
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
    }
});

var Line = React.createClass({
    componentDidMount: function() {
        if (this.props.shouldScrollTo) {
            this.getDOMNode().scrollIntoView();
        }
    },
    render: function() {
        return (
            <tr>
                <td className="line-row">
                    <code>{this.props.line.row}</code>
                </td>
                <td className="line-content">
                    <code>{this.props.line.parts.map(this.renderPart)}</code>
                </td>
            </tr>
        );
    },
    renderPart: function(part, index) {
        var classes = part.annotations.map(function(annotation) {
            if (annotation.type === "style") {
                return annotation.what;
            }
            return "";
        }).join(" ");
        return (
            <span className={classes} key={index}>
                {part.text}
            </span>
        );
    }
});

var SearchResult = React.createClass({
    getInitialState: function() {
        return {
        };
    },
    componentDidMount: function() {
        this.load();
    },
    load: function() {
        $.get('search/' + this.props.term).done(function(result) {
            this.setState({
                matches: result.matches
            });
        }.bind(this)).fail(function(error) {
            this.setState({
                error: true
            });
        }.bind(this));
    },
    render: function() {
        return (
            <BootstrapPanel error={this.state.error}>
                <div className="panel-heading">
                    <strong>Search results: {this.props.term}</strong>
                </div>
                {this.renderBody()}
            </BootstrapPanel>
        );
    },
    renderBody: function() {
        if (this.state.matches) {
            return (
                <ul className="list-group">
                    {this.state.matches.map(this.renderMatchItem)}
                </ul>
            );
        } else if (this.state.error) {
            return <BootstrapPanelBodyError />;
        } else {
            return <BootstrapPanelBodyLoading />;
        }
    },
    renderMatchItem: function(match, index) {
        return (
            <li className="list-group-item" key={index}>
                <span className="list-group-item-text">
                    <LocationLink file={match.file}
                                  row={match.row_first_match}
                                  highlight={this.props.term}
                                  handleLocationClick={this.props.handleLocationClick} />
                </span>
                <span className="list-group-item-text">
                    <div className="panel panel-default">
                        <Lines lines={match.lines} />
                    </div>
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

var BootstrapPanel = React.createClass({
    render: function() {
        return (
            <div className={["panel", this.getPanelType()].join(" ")}>
                {this.props.children}
            </div>
        );
    },
    getPanelType: function() {
        if (this.props.error) {
            return "panel-danger";
        } else {
            return "panel-default";
        }
    }
});

var BootstrapPanelBody = React.createClass({
    render: function() {
        return (
            <div className="panel-body">
                {this.props.children}
            </div>
        );
    }
});

var BootstrapPanelBodyError = React.createClass({
    render: function() {
        return (
            <BootstrapPanelBody>
                <span>Oops, something went wrong :-(</span>
            </BootstrapPanelBody>
        );
    }
});

var BootstrapPanelBodyLoading = React.createClass({
    render: function() {
        return (
            <BootstrapPanelBody>
                <span>Loading...</span>
            </BootstrapPanelBody>
        );
    }
});

$(function() {
    React.render(
        <CodeReader />,
        document.getElementById('content')
    );
});
