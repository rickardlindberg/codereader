var FileView = React.createClass({
    getInitialState: function() {
        return {
            files: []
        };
    },
    onFileSelected: function(name) {
        $.get('/file/' + name, function(result) {
            this.setState({
                files: this.state.files.concat([result])
            });
        }.bind(this));
    },
    render: function() {
        var files = this.state.files.map(function(file) {
            return <File file={file} />
        });
        return (
            <div className="span-24 last">
                <div className="span-24 last">
                    <FileSearch onFileSelected={this.onFileSelected} />
                </div>
                <div className="span-24 last">
                    {files}
                </div>
            </div>
        );
    }
});

var FileSearch = React.createClass({
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
                    <FileLink name={file} onFileSelected={this.props.onFileSelected} />
                </li>
            )
        }.bind(this));
        return (
            <li>{links}</li>
        );
    }
});

var FileLink = React.createClass({
    onClick: function(event) {
        this.props.onFileSelected(this.props.name);
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
            return <Line line={line} />;
        });
        return (
            <div className="file">
                <div className="fileHeader">
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

var Line = React.createClass({
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
