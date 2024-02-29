# Unit Testing Best Practices

## Introduction
In this tutorial, we'll cover important practices and techniques for writing effective unit tests in Java, particularly in the context of Enterprise JavaBeans (EJB) and Mockito framework. We'll discuss topics ranging from testing EJBs to mocking dependencies and handling different scenarios.

## 1. Method Mocking and verification
> Method mocking refers to the process of replacing a real method with a mock implementation during testing. This allows you to control the behavior of dependencies and isolate the unit under test.
> >For Example to test a bean class method that depends on results from dao class method, You can mock the dao methods

> Method verification is the process of asserting that certain methods were called on a mock object during testing. This allows you to ensure that the unit under test interacts with its dependencies as expected.
> > Verify called methods, e.g., audit trail and number of times it was called
- Can be applied to methods in dao classes so bean classes can use that data.
```java
    @Test
    public void saveInterestRate() throws Exception {
        // Mock dependencies
        Scheme defaultScheme = new Scheme();
        defaultScheme.setSchemePreferences(new SchemePreferences());
        defaultScheme.getSchemePreferences().setUseToDateYearContrRate(YesNo.YES);
        InterestRate rate = new InterestRate();
        String profileId = "1";
        User user = new User();

        // Set up expectations
        Date fromDate = LocalDate.now().toDate();
        AccountingPeriod ratePeriod = new AccountingPeriod();
        ratePeriod.setId(1L);
        ratePeriod.setName("Period 1");
        ratePeriod.setFromDate(fromDate);
        ratePeriod.setToDate(new Date());

        Sponsor sponsor = new Sponsor();
        sponsor.setId(1L);
        sponsor.setName("Sponsor 1");

        when(sponsorBeanI.findById(rate.getSponsorId())).thenReturn(sponsor);
        when(accountingPeriodBean.find(rate.getApId())).thenReturn(ratePeriod);
        when(interestRateDAO.save(any(InterestRate.class))).thenReturn(rate); // Mock save method

        // Invoke the method
        InterestRate result = interestRateEJB.saveInterestRate(defaultScheme, rate, profileId, user);

        // Verify the result
        assertNotNull(result);
        assertEquals(LocalDate.fromDateFields(fromDate).getYear(), result.getYear());

        // Verify interactions
        verify(interestRateDAO, times(1)).save(any(InterestRate.class));
        verify(activityTrackerBean, times(1)).trackActivity(new InterestRate().toJson(), result.toJson(), user, AppModules.ACCOUNTS, CrudOperationType.CREATE, result.getId(),
                "CREATED NEW INTEREST RATES FOR ACCOUNTING PERIOD " + ratePeriod.getName());

    }
```

## 2. Difference between `@InjectMock`, `@Mock`, and `@Spy`
- `@InjectMock`: Injects mocks into tested objects. This is used on classes
- `@Mock`: Creates mocks. This is used on interface
- `@Spy`: Wraps real objects allowing partial mocking.
- Use `@InjectMock` for objects under test, `@Mock` for dependencies, and `@Spy` for partial mocking. Partial mocking means creating an instance of the object. This is applicable in testing the real execution of a method.
```java
    @Mock
    private CommonStuffBeanI commonStuffBean;

    private CalculateBenefitsBean calculateBenefitsBean;

    @BeforeEach
    public void setup() {
        MockitoAnnotations.openMocks(this);
        calculateBenefitsBean = new CalculateBenefitsBean();
        calculateBenefitsBean.setCommonStuffBean(commonStuffBean);
    }
```
can be replaced by

```java
    @Mock
    private CommonStuffBeanI commonStuffBean;

    @Spy
    private CalculateBenefitsBean calculateBenefitsBean;

    @BeforeEach
    public void setup() {
        MockitoAnnotations.openMocks(this);
        calculateBenefitsBean.setCommonStuffBean(commonStuffBean);
    }
```

## 3. Avoid Method Chaining
- Avoid chaining methods in Mockito stubbing to avoid mockito exceptions
```java
// Avoid this
when(mock.method1().method2()).thenReturn(value);

// Prefer this
when(mock.method1()).thenReturn(someValue);
when(mock.method2()).thenReturn(otherValue);
```
TO resolve this, mock the methods separately
## 4. Avoid InjectMock on Interface
- Use `@Mock` and initialize mocks in `@BeforeEach` setup method to initialize all the mocks.
```java
    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }
```

## 5. MemberDaoImplTest
- How to test DAO classes effectively.
```java
    @Mock
    private EntityManager em;

    @Mock
    private Query query;

    @Mock
    private MemberBeanI memberBean;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void findActiveMemberById() {
        Long memberId = 1L;

        Member mockMember = new Member();
        mockMember.setId(memberId);
        mockMember.setMbshipStatus(MembershipStatus.ACTIVE); // Use MembershipStatus.ACTIVE directly

        List<Member> mockResultList = new ArrayList<>();
        mockResultList.add(mockMember);

        // Mock the EntityManager's behavior
        when(em.createNativeQuery(anyString(), eq(Member.class)))
                .thenReturn(query); // Mocking createNativeQuery to return the query mock object

        when(query.setParameter(anyString(), anyLong()))
                .thenReturn(query); // Mocking setParameter method of the query object

        when(query.getResultList())
                .thenReturn(mockResultList); // Mocking getResultList method of the query object to return mockResultList

        // Mock the memberBean to return mockMember when findActiveMemberById is called
        when(memberBean.findActiveMemberById(memberId)).thenReturn(mockMember);

        // Call the method under test
        Member result = memberBean.findActiveMemberById(memberId);

        // Verify the result
        assertNotNull(result, "Result should not be null");
        assertEquals(mockMember, result, "Result should match mock member object");
    }
```
- The method starts by mocking the behavior of the EntityManager (em) using Mockito. It mocks the createNativeQuery() method to return a mock Query object.
- Next, it mocks the behavior of the Query object (query). It sets up the setParameter() method to return the same query object when invoked with any parameters. It also configures the getResultList() method to return a list containing a mock member object.
- The method then mocks the behavior of the memberBean object. It sets up the findActiveMemberById() method to return a mock member object when called with a specific member ID (memberId).
- After setting up the mocks, it invokes the findActiveMemberById() method with the memberId.
- Finally, it verifies that the returned member object is not null and matches the expected mock member object.
## 6. Mocking Void Methods
- You can check for exceptions for void method or verify if child methods were called correctly i.e
1. You can check if the correct exception message is thrown
```java

        // Mock void method and throw an exception
        doThrow(new RuntimeException("Error processing bank details")).when(bankDetailsBean).validateMemberAccount(member);

        // Act and Assert
        RuntimeException runtimeException = assertThrows(RuntimeException.class, () -> bankDetailsBean.validateMemberAccount(member),
                "Exception should be thrown when processing bank details");
```
> You can also verify the exption message thrown if its correct using `assertequals`
2. check on cases where it won't trow an exception
```java
// Act and Assert
        assertDoesNotThrow(() -> bankDetailsBean.validateMemberAccount(member));
```

## 7. Handling Numbers
- Use primitives for numbers or specify a delta for floating-point assertions.
```java
double expectedValue = 10.0;
double actualValue = calculateSomeValue();

double delta = 0.001; // Specify a small delta for comparison

assertEquals(expectedValue, actualValue, delta);
```
>This is mostly applicable to bigdecimal values

## 8. Mock Interfaces, Not Classes
- Mockito mocks interfaces by default for better flexibility.

## 9. Mock Part of Object
Mocking part of an object and calling actual implementations involves creating a partial mock of an object, where certain methods are mocked while others are left to call the actual implementation.
```java
@Test
void createGeneralContribution() throws Exception {
        // Test data
        Member member = new Member();
        member.setId(1L);

        Batch batch = new Batch();
        batch.setId(2L);

        Date datePaid = java.sql.Date.valueOf(LocalDate.now());

        // Create a general contribution without saving
        Contribution contribution = contributionBean.createGeneralContribution(
                false, null, member.getId(), member, 2024, com.systech.fm.model.members.Month.JAN, batch, batch.getId(),
                datePaid, ContributionType.NORMAL, ContributionStatus.REGISTERED, 3L, SalaryType.GIVEN,
                new BigDecimal("5000.00"), new BigDecimal("5000.00"), new BigDecimal("300.00"),
                new BigDecimal("200.00"), new BigDecimal("100.00"), new BigDecimal("50.00"),
                new BigDecimal("25.00"), new BigDecimal("20.00"), new BigDecimal("15.00"),
                new BigDecimal("10.00"), new BigDecimal("5.00"), new BigDecimal("2.50"),
                new BigDecimal("2.50"), new BigDecimal("2.50"), new BigDecimal("2.50"), null, null, null, null);

        // Validate the created contribution
        assertNotNull(contribution);
        assertNull(contribution.getId()); // Since we didn't save it

        // Create a general contribution and save it
        contribution.setId(1L);
        when(contributionDao.save(any())).thenReturn(contribution);

        Contribution savedContribution = contributionBean.createGeneralContribution(
                true, null, member.getId(), member, 2024, com.systech.fm.model.members.Month.JAN, batch, batch.getId(),
                datePaid, ContributionType.NORMAL, ContributionStatus.REGISTERED, 3L, SalaryType.GIVEN,
                new BigDecimal("5000.00"), new BigDecimal("5000.00"), new BigDecimal("300.00"),
                new BigDecimal("200.00"), new BigDecimal("100.00"), new BigDecimal("50.00"),
                new BigDecimal("25.00"), new BigDecimal("20.00"), new BigDecimal("15.00"),
                new BigDecimal("10.00"), new BigDecimal("5.00"), new BigDecimal("2.50"),
                new BigDecimal("2.50"), new BigDecimal("2.50"), new BigDecimal("2.50"), null, null, null, null);

        // Validate the saved contribution
        assertNotNull(savedContribution);
        assertNotNull(savedContribution.getId());
        assertEquals(member.getId(), savedContribution.getMemberId());
        assertEquals(batch.getId(), savedContribution.getBatchId());
        assertEquals(2024, savedContribution.getYear());
        assertEquals(Month.JAN.name(), savedContribution.getMonth().name());
        assertEquals(datePaid, savedContribution.getDatePaid());
        assertEquals(ContributionType.NORMAL, savedContribution.getType());
        assertEquals(ContributionStatus.REGISTERED, savedContribution.getStatus());
        assertEquals(3L, savedContribution.getApId());
        assertEquals(SalaryType.GIVEN, savedContribution.getSalaryType());
        assertEquals(new BigDecimal("5000.00"), savedContribution.getSalary());
        assertEquals(new BigDecimal("5000.00"), savedContribution.getBasicSalary());
        assertEquals(new BigDecimal("300.00"), savedContribution.getEe());
        assertEquals(new BigDecimal("200.00"), savedContribution.getEr());
        assertEquals(new BigDecimal("100.00"), savedContribution.getAvc());
        assertEquals(new BigDecimal("50.00"), savedContribution.getAvcer());
        assertEquals(new BigDecimal("25.00"), savedContribution.getSupplementary());
        assertEquals(new BigDecimal("20.00"), savedContribution.getBrokerFee());
        assertEquals(new BigDecimal("15.00"), savedContribution.getAdminFee());
        assertEquals(new BigDecimal("10.00"), savedContribution.getGroupAssurance());
        assertEquals(new BigDecimal("5.00"), savedContribution.getGeneralReserve());
        assertEquals(new BigDecimal("2.50"), savedContribution.getIncomeProtectionPlan());
        assertEquals(new BigDecimal("7.50"), savedContribution.getNssf());
    }
```
>`createGeneralContribution()` tests the `ContributionBean` class's `createGeneralContribution()` method. It creates a general contribution object, both with and without saving it to the database, and validates the behavior.
> 
> `ContributionDao` is mocked to return a specific Contribution object when the `save()` method is called. However, the actual implementation of the `save()` method is allowed to execute, which means the contribution object is persisted to the database.

> Mocking part of an object and calling actual implementations is useful when you want to retain the original behavior of certain methods while mocking others for testing purposes. This approach allows for more flexible and focused unit tests by controlling specific interactions with dependencies.

Another example
```java
public void test_generatePenBenNumber_memberNumberFormatWithZeroMemberNumber(){
        //Create an object to get actual method return
        BenefitBean benefitBean = new BenefitBean();
        benefitBean.setPensionerBean(pensionerBean);

        // Arrange
        Benefit ben = new Benefit();
        Scheme scheme = new Scheme();
        List<Pensioner> bens = new ArrayList<>();
        SetupParams setupParams = new SetupParams();
        Beneficiary b = new Beneficiary();
        b.setMember(new Member());

        ben.setDateOfCalculation(new Date());
        // scheme.setSchemeId(1L);
        b.getMember().setMemberNo(0L);
        setupParams.setPensionNumberFormat(PensionNumberFormat.MEMBER_NUMBER);

        // Act
        when(pensionerBean.pensionersThisMonth(new DateTime(ben.getDateOfCalculation()).toDate(),scheme)).thenReturn(1);
        when(pensionerBean.getNextPenSeq(new DateTime(ben.getDateOfCalculation()), scheme)).thenReturn(1);
        try {
            String result = benefitBean.generatePenBenNumber(ben, scheme, bens, setupParams, b);

            // Assert
            assertEquals("B0010000", result);
            verify(pensionerBean).getNextPenSeq(new DateTime(ben.getDateOfCalculation()), scheme);
        }catch (Exception e){
            fail("Exception should not be thrown here: "+e.getMessage());
        }
    }
```
> Mockito's `when()` method is used to specify the behavior of the mocked methods `(pensionersThisMonth() and getNextPenSeq())`. The try-catch block ensures that any unexpected exceptions thrown during the test execution are caught and handled appropriately. This approach allows for controlled testing of the `generatePenBenNumber() `method while maintaining the actual behavior.

## 10. Handling Unexpected Exceptions
Use `fail` to handle unexpected exceptions in tests.

Using `fail()` when an unexpected exception is thrown in a test is a way to explicitly mark the test as failed when an exception occurs that is not expected or handled within the test case.


## 11. Use of BeforeEach  and AfterEach on repetitive method calls
- Utilize `@BeforeEach` and `@AfterEach` methods for setup and teardown.
- Verify common method invocations and their frequencies using Mockito.
```java

    @BeforeEach
    public void setUp() throws Exception {
        MockitoAnnotations.openMocks(this);
        contributionReversalBean = new ContributionReversalBean();
        contributionReversalBean.setCommonStuffBean(commonStuffBean);
        contributionReversalBean.setAccountingPeriodBean(accountingPeriodBean);
        contributionReversalBean.setContributionBean(contributionBean);

        AccountingPeriod accountingPeriod = new AccountingPeriod();
        accountingPeriod.setId(1L);

        when(commonStuffBean.sanitizeBigDecimal(any(BigDecimal.class))).thenAnswer(invocationOnMock -> invocationOnMock.getArgument(0));
        when(accountingPeriodDAO.findByDatePeriodScheme(any(),any(), any())).thenReturn(accountingPeriod);
        when(accountingPeriodBean.getPeriod(any(),any(), any())).thenReturn(accountingPeriod);
        when(contributionBean.save(any())).thenAnswer(invocationOnMock -> invocationOnMock.getArgument(0));
    }

    @AfterEach
    public void doFinish() throws Exception {
        // Verify that commonStuffBean.sanitizeBigDecimal() was called with any BigDecimal argument
        verify(commonStuffBean, times(7)).sanitizeBigDecimal(any(BigDecimal.class));
    }
```
>  This ensures that each test method executes in a consistent and isolated environment, leading to more reliable and maintainable test suites.
## 12. Avoid Dependency Injection in Test Classes
- Avoid annotations like `@EJB` or `@Inject` in test classes for cleaner testing.
1. Test classes should focus solely on testing the behavior of the unit under test rather than managing dependencies. Injecting dependencies using annotations like `@EJB` or `@Inject` can introduce unnecessary complexity and coupling in test classes.
2. Using annotations like `@EJB` or `@Inject` may require setting up a container environment or a dependency injection framework for test execution. This adds overhead and makes tests dependent on the availability and configuration of such environments.
3. Test classes should be isolated from external dependencies to ensure that failures are due to issues in the unit being tested rather than its dependencies. By avoiding annotations that inject dependencies, tests become more self-contained and easier to diagnose and debug.

## Conclusion
Mastering these testing practices will lead to more robust and maintainable unit tests, ensuring the reliability and stability of your Java applications.
