import { Typography, Col, Row } from 'antd'
import { BrowserRouter, Route, Redirect, Switch } from 'react-router-dom'

import { ContentCard, Layout } from './Layout'

import { Dashboard } from './pages/Dashboard'
import { Plugins } from './pages/Plugins'

export function App() {
  return (
    <BrowserRouter>
      <Switch>
        <Route exact path="/dashboard" component={Dashboard} />
        <Redirect exact from="/" to="/dashboard" />

        <Route exact path="/plugins" component={Plugins} />

        <Route
          path="*"
          component={() => {
            return (
              <Layout title="404">
                <ContentCard>
                  <Typography.Paragraph>Unknown Page</Typography.Paragraph>
                </ContentCard>
              </Layout>
            )
          }}
        />
      </Switch>
    </BrowserRouter>
  )
}
