var boxStyle = {
    border: 1,
    borderStyle: 'solid',
    padding: 2
};

var FileView = React.createClass({
    getInitialState: function() {
        return {
            name: "",
            lines: [
            ]
        };
    },
    onFileSelected: function(name) {
        $.get('/file/' + name, function(result) {
            this.setState(result);
        }.bind(this));
    },
    render: function() {
        return (
            <div>
                <FileSearch onFileSelected={this.onFileSelected} />
                <File file={this.state} />
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
    onClick: function() {
        this.props.onFileSelected(this.props.name);
    },
    render: function() {
        return (
            <a href="#" onClick={this.onClick}>{this.props.name}</a>
        );
    }
});

var File = React.createClass({
    render: function() {
        var lines = this.props.file.lines.map(function(line) {
            return <Line line={line} />;
        });
        return (
            <div>
                <div style={boxStyle}>
                    <strong>{this.props.file.name}</strong>
                </div>
                <div style={boxStyle}>
                    <pre className="highlight">
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
