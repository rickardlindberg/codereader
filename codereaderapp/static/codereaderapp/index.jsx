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
                    <LocationSearch onLocationSelected={this.onLocationSelected} />
                </div>
                <div className="span-24 last">
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
            <li>{links}</li>
        );
    }
});

var LocationLink = React.createClass({
    onClick: function(event) {
        this.props.onLocationSelected({
            file: this.props.name,
            row: 5
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
