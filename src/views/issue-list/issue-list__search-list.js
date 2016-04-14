import React, {ListView, Text, TouchableOpacity, StyleSheet} from 'react-native';
import InvertibleScrollView from 'react-native-invertible-scroll-view';

let ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});

class SearchListView extends React.Component {
  constructor() {
    super();
    this.state = {dataSource: ds.cloneWithRows([])};
  }

  componentDidMount() {
    this.props.getIssuesFolder()
      .then((issueFolders) => {
        if (!this.isUnmounted) {
          this.setState({
            dataSource: ds.cloneWithRows(issueFolders)
          });
        }
      });
  }

  componentWillUnmount() {
    this.isUnmounted = true;
  }

  applyIssueFolder(query) {
    this.props.onAddQuery(query);
  }

  _renderRow(issueFolder) {
    return (
      <TouchableOpacity
        style={styles.searchRow}
        underlayColor='#FFF'
        onPress={() => this.applyIssueFolder(issueFolder.query)}>
        <Text style={styles.searchText}>{issueFolder.name}</Text>
      </TouchableOpacity>);
  }

  render() {
    return (
      <ListView
        dataSource={this.state.dataSource}
        renderRow={(issueFolder) => this._renderRow(issueFolder)}
        renderScrollComponent={props => <InvertibleScrollView {...props} inverted />}
        keyboardShouldPersistTaps={true}/>
    );
  }
}

let styles = StyleSheet.create({
  searchRow: {
    flex: 1,
    padding: 16
  },
  searchText: {
    flex: 1,
    fontSize: 20,
    textAlign: 'center'
  }
});

module.exports = SearchListView;
