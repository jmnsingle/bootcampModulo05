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
    filter: ['all', 'open', 'closed'],
    page: 1,
    active: 0,
    activePage: false,
  };

  async componentDidMount() {
    const { match } = this.props;
    const { filter } = this.state;

    const repoName = decodeURIComponent(match.params.repository);

    const [repository, issues] = await Promise.all([
      api.get(`/repos/${repoName}`),
      api.get(`/repos/${repoName}/issues`, {
        params: {
          state: filter[0],
          per_page: 5,
        },
      }),
    ]);

    this.setState({
      repository: repository.data,
      issues: issues.data,
      loading: false,
    });
  }

  loadList = async index => {
    try {
      await this.setState({ active: index, loading: true });
      const { page, active, filter } = this.state;

      const { match } = this.props;

      const repoName = decodeURIComponent(match.params.repository);

      const [repository, issues] = await Promise.all([
        api.get(`/repos/${repoName}`),
        api.get(`/repos/${repoName}/issues`, {
          params: {
            state: filter[active],
            per_page: 10,
            page,
          },
        }),
      ]);

      if (issues.data == '') {
        throw new Error('sem dados');
      }

      this.setState({
        repository: repository.data,
        issues: issues.data,
        loading: false,
      });
    } catch (error) {
      console.log(error.message);
      this.setState({ loading: false });
    }
  };

  handlePage = async op => {
    const { page, active } = this.state;

    await this.setState({
      page: op === 'next' ? page + 1 : page - 1,
    });
    this.loadList(active);
  };

  render() {
    const { repository, issues, loading, activePage } = this.state;

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
              <h4>Filtrar por</h4>
            </div>
            <div>
              <button type="button" onClick={() => this.loadList(0)}>
                TODOS
              </button>
              <button type="button" onClick={() => this.loadList(1)}>
                ABERTOS
              </button>
              <button type="button" onClick={() => this.loadList(2)}>
                FECHADOS
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
              <button
                disabled={activePage}
                page={activePage}
                type="button"
                onClick={() => this.handlePage('previous')}
              >
                Anterior
              </button>
              <button
                page={activePage}
                disabled={activePage}
                type="button"
                onClick={() => this.handlePage('next')}
              >
                Próximo
              </button>
            </div>
          </div>
        </Filter>
      </Container>
    );
  }
}
