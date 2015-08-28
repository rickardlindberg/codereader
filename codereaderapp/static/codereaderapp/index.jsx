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
        $.get('/file', function(result) {
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
    componentDidMount: function() {
        this.props.onFileSelected("hello.js");
    },
    render: function() {
        return (
            <p>Search...</p>
        );
    }
});

var File = React.createClass({
    render: function() {
        var lines = this.props.file.lines.map(function(line) {
            return <Line line={line} key={line.row} />;
        });
        return (
            <div>
                <div style={boxStyle}>
                    <strong>{this.props.file.name}</strong>
                </div>
                <div style={boxStyle}>
                    {lines}
                </div>
            </div>
        );
    }
});

var Line = React.createClass({
    render: function() {
        return (
            <pre>
                {this.props.line.text}
            </pre>
        );
    }
});

React.render(
    <FileView />,
    document.getElementById('content')
);
