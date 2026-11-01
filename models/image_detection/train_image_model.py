import torch
import torch.nn as nn
from torchvision.models import resnet50, ResNet50_Weights


class SafeLensResNet50(nn.Module):

    def __init__(self, num_classes=2):

        super().__init__()

        # Load pretrained ResNet-50
        self.model = resnet50(
            weights=ResNet50_Weights.DEFAULT
        )

        # Replace the final classification layer
        input_features = self.model.fc.in_features

        self.model.fc = nn.Linear(
            input_features,
            num_classes
        )

    def forward(self, images):

        return self.model(images)


if __name__ == "__main__":

    device = torch.device(
        "cuda" if torch.cuda.is_available() else "cpu"
    )

    model = SafeLensResNet50(num_classes=2)
    model = model.to(device)

    print("SafeLens AI ResNet-50 initialized")
    print("Device:", device)
    print("Output classes: 2")
    print("Class 0: Real")
    print("Class 1: Fake")