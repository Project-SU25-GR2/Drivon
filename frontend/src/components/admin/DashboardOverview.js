import React from 'react';

const DashboardOverview = () => {
    return (
        <div className="dashboard-content">
            {/* Metric Cards */}
            <div className="metric-cards">
                <div className="card">
                    <div className="card-title">Total Visits</div>
                    <div className="card-value">10,500</div> {/* Placeholder value */}
                    <div className="card-trend">
                        {/* Placeholder for small chart */}
                        <div className="mini-chart"></div>
                        <span className="percentage-change positive">+10%</span>
                    </div>
                </div>

                <div className="card">
                    <div className="card-title">Total Page Views</div>
                    <div className="card-value">50,000</div> {/* Placeholder value */}
                    <div className="card-trend">
                        {/* Placeholder for small chart */}
                        <div className="mini-chart"></div>
                        <span className="percentage-change negative">-7%</span>
                    </div>
                </div>

                <div className="card">
                    <div className="card-title">Unique Visitor</div>
                    <div className="card-value">8,200</div> {/* Placeholder value */}
                    <div className="card-trend">
                        {/* Placeholder for small chart */}
                        <div className="mini-chart"></div>
                        <span className="percentage-change negative">-12%</span>
                    </div>
                </div>

                <div className="card">
                    <div className="card-title">Bounce Rate</div>
                    <div className="card-value">33%</div> {/* Placeholder value */}
                    <div className="card-trend">
                         {/* Placeholder for small chart */}
                         <div className="mini-chart"></div>
                         <span className="percentage-change positive">+33%</span> {/* Example positive change */}
                    </div>
                </div>
            </div>

            {/* Site Visits Section */}
            <div className="site-visits-section">
                <h4>Site Visits</h4>
                <div className="site-visits-content">
                    <div className="world-map-placeholder">
                        {/* Placeholder for World Map */}
                        World Map goes here
                    </div>
                    <div className="regional-stats">
                        {/* Regional Stats List */}
                        <div className="stat-item">
                            <div className="stat-label">100k</div>
                            <div className="stat-region">Visitors From USA</div>
                            <div className="progress-bar-container">
                                <div className="progress-bar" style={{ width: '50%', backgroundColor: '#6f42c1' }}></div> {/* Example color */}
                            </div>
                            <div className="stat-percentage">50%</div>
                        </div>
                         <div className="stat-item">
                            <div className="stat-label">1M</div>
                            <div className="stat-region">Visitors From Europe</div>
                            <div className="progress-bar-container">
                                <div className="progress-bar" style={{ width: '80%', backgroundColor: '#28a745' }}></div> {/* Example color */}
                            </div>
                            <div className="stat-percentage">80%</div>
                        </div>
                         <div className="stat-item">
                            <div className="stat-label">450k</div>
                            <div className="stat-region">Visitors From Australia</div>
                            <div className="progress-bar-container">
                                <div className="progress-bar" style={{ width: '40%', backgroundColor: '#007bff' }}></div> {/* Example color */}
                            </div>
                            <div className="stat-percentage">40%</div>
                        </div>
                         <div className="stat-item">
                            <div className="stat-label">1B</div>
                            <div className="stat-region">Visitors From India</div>
                            <div className="progress-bar-container">
                                <div className="progress-bar" style={{ width: '90%', backgroundColor: '#dc3545' }}></div> {/* Example color */}
                            </div>
                            <div className="stat-percentage">90%</div>
                        </div>
                        {/* Add more regional stats as needed */}
                    </div>
                </div>
            </div>

            {/* Placeholder for Circular Charts */}
            <div className="circular-charts-section">
                 <h4>User Statistics</h4> {/* Example title */}
                 <div className="circular-charts-container">
                     <div className="chart-item">
                         {/* Placeholder for New Users Chart */}
                         <div className="circular-chart">75%</div> {/* Placeholder value */}
                         <div className="chart-label">New Users</div>
                     </div>
                     <div className="chart-item">
                          {/* Placeholder for New Purchases Chart */}
                          <div className="circular-chart">50%</div> {/* Placeholder value */}
                          <div className="chart-label">New Purchases</div>
                      </div>
                      <div className="chart-item">
                           {/* Placeholder for Bounce Rate Chart */}
                           <div className="circular-chart">90%</div> {/* Placeholder value */}
                           <div className="chart-label">Bounce Rate</div>
                       </div>
                 </div>
            </div>

             {/* Remaining Widgets Section */}
             <div className="remaining-widgets">
                 <div className="widget monthly-stats">
                     <h4>Monthly Stats</h4>
                     {/* Placeholder content */}
                     <p>Monthly stats content here.</p>
                 </div>
                 <div className="widget todo-list">
                     <h4>Todo List</h4>
                     {/* Placeholder content */}
                     <ul>
                         <li>Call John for Dinner</li>
                         <li>Book Boss Flight 2 Days</li>
                         <li>Hit the Gym 3 Minutes</li>
                         <li>Give Purchase Report not important</li>
                         <li>Watch Game of Thrones Episode Tomorrow</li>
                         <li>Give Purchase report Done</li>
                     </ul>
                 </div>
                 <div className="widget sales-report">
                     <h4>Sales Report</h4>
                     {/* Placeholder content */}
                      <p>Sales: $6,000</p>
                      {/* Placeholder for sales table */}
                      <table>
                          <thead>
                              <tr>
                                  <th>Name</th>
                                  <th>Status</th>
                                  <th>Date</th>
                                  <th>Price</th>
                              </tr>
                          </thead>
                          <tbody>
                              <tr><td>Item #1 Name</td><td>Unavailable</td><td>Nov 18</td><td>$12</td></tr>
                              <tr><td>Item #2 Name</td><td>New</td><td>Nov 19</td><td>$34</td></tr>
                              <tr><td>Item #3 Name</td><td>New</td><td>Nov 20</td><td>-$45</td></tr>
                              <tr><td>Item #4 Name</td><td>Unavailable</td><td>Nov 21</td><td>$65</td></tr>
                              <tr><td>Item #5 Name</td><td>Used</td><td>Nov 22</td><td>$78</td></tr>
                              <tr><td>Item #6 Name</td><td>Used</td><td>Nov 23</td><td>-$88</td></tr>
                              <tr><td>Item #7 Name</td><td>Old</td><td>Nov 22</td><td>$56</td></tr>
                          </tbody>
                      </table>
                      <p><a href="#">Check all the sales</a></p>
                 </div>
                 <div className="widget weather">
                     <h4>Weather</h4>
                      {/* Placeholder content */}
                      <p>32°F Partly Clouds</p>
                      <p>Monday, Nov 01 2017</p>
                      <p>Wind: 10km/h, Sunrise: 05:00 AM, Pressure: 1B</p>
                 </div>
                 <div className="widget quick-chat">
                     <h4>Quick Chat</h4>
                      {/* Placeholder content */}
                     <div>Chat messages here...</div>
                 </div>
             </div>

        </div>
    );
};

export default DashboardOverview; 