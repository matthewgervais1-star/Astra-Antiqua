namespace AstraAntiqua.App;

public class App : Application
{
    protected override Window CreateWindow(IActivationState? activationState)
        => new(new MainPage());
}
