import React, { Component } from 'react';
import PropTypes from 'prop-types';
import api from '../../services/api';

import Container from '../../components/Container';
import { Loading, Owner, IssueList, Filter } from './styles';

export default class Repository extends Component {
  static propTypes = {
    match: PropTypes.shape({
      params: PropTypes.shape({
        repository: PropTypes.string,
      }),
    }).isRequired,
  };

  state = {
    repository: {},
    issues: [],
    loading: true,
    filter: 'all',
    page: 1,
  };

  componentDidMount() {
    this.loadList();
  }

  // componentDidUpdate(){
  //  this.loadList();
  // }

  loadList = async (filter, page) => {
    this.setState({ loading: true, filter });
    const { match } = this.props;

    const repoName = decodeURIComponent(match.params.repository);

    const [repository, issues] = await Promise.all([
      api.get(`/repos/${repoName}`),
      api.get(`/repos/${repoName}/issues?page=${this.state.page}${page}${1}`, {
        params: {
          state: filter,
          per_page: 5,
        },
      }),
    ]);

    this.setState({
      repository: repository.data,
      issues: issues.data,
      loading: false,
    });

    console.log(`result = ${this.state.page}${page}${1}`);
  };

  render() {
    const { repository, issues, loading, page, filter } = this.state;

    if (loading) {
      return <Loading>Carregando</Loading>;
    }

    return (
      <Container>
        <Owner>
          <img src={repository.owner.avatar_url} alt={repository.owner.login} />
          <h1>{repository.name}</h1>
          <p>{repository.description}</p>
        </Owner>
        <Filter>
          <div>
            <div>
              <h4>Filter by</h4>
            </div>
            <div>
              <button type="button" onClick={() => this.loadList('all', '')}>
                ALL
              </button>
              <button type="button" onClick={() => this.loadList('open', '')}>
                OPEN
              </button>
              <button type="button" onClick={() => this.loadList('closed', '')}>
                CLOSED
              </button>
            </div>
          </div>
        </Filter>
        <IssueList>
          {issues.map(issue => (
            <li key={String(issue.id)}>
              <img src={issue.user.avatar_url} alt="" />
              <div>
                <strong>
                  <a href={issue.html_url}>{issue.title}</a>
                  {issue.labels.map(label => (
                    <span key={String(label.id)}>{label.name}</span>
                  ))}
                </strong>
                <p>{issue.user.login}</p>
              </div>
            </li>
          ))}
        </IssueList>
        <Filter>
          <div>
            <div>
              {page > 1 && (
                <button
                  type="button"
                  onClick={() => this.loadList(filter, '-')}
                >
                  anterior
                </button>
              )}
              {page !== 0 && (
                <button
                  type="button"
                  onClick={() => this.loadList(filter, '+')}
                >
                  Próximo
                </button>
              )}
            </div>
          </div>
        </Filter>
      </Container>
    );
  }
}
